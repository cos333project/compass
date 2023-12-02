import logging
import re

from django.db.models import Case, Q, Value, When
from django.http import JsonResponse
from django.views import View
from .models import models, Course, Department, Degree, Major, Minor, \
    Certificate, Requirement, CustomUser, UserCourses
from django.views.decorators.csrf import csrf_exempt
from .serializers import CourseSerializer
import json
from data.configs import Configs
from data.req_lib import ReqLib
from data.check_reqs import check_user
from datetime import datetime
import django_cas_ng.views

logger = logging.getLogger(__name__)

# ------------------------------------ PROFILE ----------------------------------------#

def fetch_user_info(user):
    net_id = getattr(user, 'net_id', None)
    if not net_id:
        return JsonResponse({'error': 'User not found'}, status=404)

    configs = Configs()
    req_lib = ReqLib()
    user_inst = CustomUser.objects.get(net_id=net_id)
    major_inst = user_inst.major
    minors_list = []

    major = {}
    if major_inst is not None:
        major = {'code': major_inst.code, 'name': major_inst.name}
    else:
        major = {}

    for minor_inst in user_inst.minors.all():
        minors_list.append({'code': minor_inst.code, 'name': minor_inst.name})

    student_profile = req_lib.getJSON(f'{configs.USERS_FULL}?uid={net_id}')
    default_class_year, default_first_name, default_last_name = None, None, None
    if student_profile:
        match = re.search(r'Class of (\d{4})', student_profile[0]['dn'])
        if match:
            default_class_year = int(match.group(1))
        default_full_name = student_profile[0].get('displayname')
        default_first_name, default_last_name = (default_full_name.split(' ', 1) + ['', ''])[:2]

    if default_class_year is None:
        default_class_year = datetime.now().year + 1

    return {
        'netId': net_id,
        'universityId': getattr(user, 'university_id', None),
        'email': getattr(user, 'email', None),
        'firstName': getattr(user, 'first_name', default_first_name),
        'lastName': getattr(user, 'last_name', default_last_name),
        'classYear': getattr(user, 'class_year', default_class_year),
        'department': getattr(
            user, 'department', None
        ),  # May not exist in API for undergrads
        'major': major,
        'minors': minors_list,
    }


def profile(request):
    user_info = fetch_user_info(request.user)
    return JsonResponse(user_info)

# @csrf_exempt
# def login(request):
#     if request.user.is_authenticated:
#         return redirect("index")
#     else:
#         return django_cas_ng.views.LoginView.as_view()(request)

# def logout(request):
#     return django_cas_ng.views.LogoutView.as_view()(request)

# TODO: Need to give csrf token instead of exempting it in production
@csrf_exempt
def update_profile(request):
    # TODO: Validate this stuff
    data = json.loads(request.body)
    updated_first_name = data.get('firstName', '')
    updated_last_name = data.get('lastName', '')
    updated_major = data.get('major', '')
    updated_minors = data.get('minors', [])
    updated_class_year = data.get('classYear', None)
    print("Updated class year: ", updated_class_year)

    # Fetch the user's profile
    net_id = request.user.net_id
    user_inst = CustomUser.objects.get(net_id=net_id)
    print(
        f'USER PROFILE: {user_inst.first_name} {user_inst.last_name} {user_inst.major} {user_inst.minors} {user_inst.class_year}'
    )

    # Update user's profile
    user_inst.first_name = updated_first_name
    user_inst.last_name = updated_last_name
    if updated_major != '':
        user_inst.major = Major.objects.get(code=updated_major['code'])
    else:
        user_inst.major = None

    if isinstance(updated_minors, list):
        # Assuming each minor is represented by its 'code' and you have Minor models
        minor_objects = [
            Minor.objects.get(code=minor.get('code', '')) for minor in updated_minors
        ]
        user_inst.minors.set(minor_objects)

    user_inst.class_year = updated_class_year
    user_inst.save()
    updated_user_info = fetch_user_info(request.user)
    print(f'UPDATED USER INFO: {updated_user_info}')
    return JsonResponse(updated_user_info)


# ------------------------------------ LOG IN -----------------------------------------#

def authenticate(request):
    is_authenticated = request.user.is_authenticated
    if is_authenticated:
        user_info = fetch_user_info(request.user)
        logger.info(
            f'User is authenticated. User info: {user_info}. Cookies: {request.COOKIES}'
        )
        return JsonResponse({'authenticated': True, 'user': user_info})
    else:
        logger.info('User is not authenticated.')
        return JsonResponse({'authenticated': False, 'user': None})


# ------------------------------- SEARCH COURSES --------------------------------------#

DEPT_NUM_SUFFIX_REGEX = re.compile(r'^[a-zA-Z]{1,3}\d{1,3}[a-zA-Z]{1}$', re.IGNORECASE)
DEPT_NUM_REGEX = re.compile(r'^[a-zA-Z]{1,3}\d{1,3}$', re.IGNORECASE)
DEPT_ONLY_REGEX = re.compile(r'^[a-zA-Z]{1,3}$', re.IGNORECASE)
NUM_SUFFIX_ONLY_REGEX = re.compile(r'^\d{1,3}[a-zA-Z]{1}$', re.IGNORECASE)
NUM_ONLY_REGEX = re.compile(r'^\d{1,3}$', re.IGNORECASE)


class SearchCourses(View):
    """
    Handles search queries for courses.
    """

    def get(self, request, *args, **kwargs):
        query = request.GET.get('course', None)
        if query:
            # if query == '*' or query == '.':
            #     courses = Course.objects.select_related('department').all()
            #     serialized_courses = CourseSerializer(courses, many=True)
            #     return JsonResponse({'courses': serialized_courses.data})

            # process queries
            trimmed_query = re.sub(r'\s', '', query)
            # title = ''
            if DEPT_NUM_SUFFIX_REGEX.match(trimmed_query):
                result = re.split(r'(\d+[a-zA-Z])', string=trimmed_query, maxsplit=1)
                dept = result[0]
                num = result[1]
            elif DEPT_NUM_REGEX.match(trimmed_query):
                result = re.split(r'(\d+)', string=trimmed_query, maxsplit=1)
                dept = result[0]
                num = result[1]
            elif NUM_ONLY_REGEX.match(trimmed_query) or NUM_SUFFIX_ONLY_REGEX.match(trimmed_query):
                dept = ''
                num = trimmed_query
            elif DEPT_ONLY_REGEX.match(trimmed_query):
                dept = trimmed_query
                num = ''
            else:
                return JsonResponse({'courses': []})
                # dept = ''
                # num = ''

            try:
                # exact_match_course = Course.objects.select_related('department').filter(
                #     Q(department__code__iexact=dept) & Q(catalog_number__iexact=num)
                # )
                # if exact_match_course:
                #     # If an exact match is found, return only that course
                #     serialized_course = CourseSerializer(exact_match_course, many=True)
                #     return JsonResponse({'courses': serialized_course.data})
                courses = Course.objects.select_related('department').filter(
                    Q(department__code__icontains=dept)
                    & Q(catalog_number__icontains=num)
                )
                if not courses.exists():
                    return JsonResponse({'courses': []})
                custom_sorting_field = Case(
                    When(
                        Q(department__code__icontains=dept)
                        & Q(catalog_number__icontains=num),
                        then=Value(3),
                    ),
                    When(Q(department__code__icontains=dept), then=Value(2)),
                    When(Q(catalog_number__icontains=num), then=Value(1)),
                    default=Value(0),
                    output_field=models.IntegerField(),
                )
                sorted_courses = courses.annotate(
                    custom_sorting=custom_sorting_field
                ).order_by(
                    '-custom_sorting', 'department__code', 'catalog_number', 'title'
                )
                serialized_courses = CourseSerializer(sorted_courses, many=True)
                return JsonResponse({'courses': serialized_courses.data})

            except Exception as e:
                logger.error(f'An error occurred while searching for courses: {e}')
                return JsonResponse({'error': 'Internal Server Error'}, status=500)
        else:
            return JsonResponse({'courses': []})


class GetUserCourses(View):
    """
    Retrieves user's courses for frontend
    """

    def get(self, request, *args, **kwargs):
        net_id = request.user.net_id
        user_inst = CustomUser.objects.get(net_id=net_id)
        user_course_dict = {}

        if net_id:
            try:
                for semester in range(1, 9):
                    user_courses = Course.objects.filter(
                        usercourses__user=user_inst, usercourses__semester=semester
                    )
                    serialized_courses = CourseSerializer(user_courses, many=True)
                    user_course_dict[semester] = serialized_courses.data

                return JsonResponse(user_course_dict)

            except Exception as e:
                logger.error(f'An error occurred while retrieving courses: {e}')
                return JsonResponse({'error': 'Internal Server Error'}, status=500)
        else:
            return JsonResponse({})


# ---------------------------- UPDATE USER COURSES -----------------------------------#


def parse_semester(semester_id, class_year):
    season = semester_id.split(' ')[0]
    year = int(semester_id.split(' ')[1])
    is_Fall = 1 if (season == 'Fall') else 0
    semester_num = 8 - ((class_year - year) * 2 - is_Fall)

    return semester_num


# This needs to be changed.
def get_first_course_inst(course_code):
    department_code = course_code.split(' ')[0]
    catalog_number = course_code.split(' ')[1]
    course_inst = Course.objects.filter(
        department__code=department_code, catalog_number=catalog_number
    )[0]
    return course_inst


@csrf_exempt
def update_user_courses(request):
    try:
        data = json.loads(request.body)
        print("AMONGUSSSSSSSSSSSSSSSs", data)
        course_code = data.get('courseId')  # might have to adjust this, print
        container = data.get('semesterId')
        net_id = request.user.net_id
        user_inst = CustomUser.objects.get(net_id=net_id)
        class_year = user_inst.class_year
        course_inst = get_first_course_inst(course_code)

        if container == 'Search Results' or container == 'void':
            user_course = UserCourses.objects.get(user=user_inst, course=course_inst)
            user_course.delete()
            message = f'User course deleted: {course_inst.course_id}, {net_id}'

        else:
            semester = parse_semester(container, class_year)

            user_course, created = UserCourses.objects.update_or_create(
                user=user_inst, course=course_inst, defaults={'semester': semester}
            )
            if created:
                message = f'User course added: {semester}, {course_inst.course_id}, {net_id}'
            else:
                message = f'User course updated: {semester}, {course_inst.course_id}, {net_id}'

        return JsonResponse({'status': 'success', 'message': message})

    except Exception as e:
        # Log the detailed error internally
        logger.error(f'An internal error occurred: {e}', exc_info=True)

        # Return a generic error message to the user
        return JsonResponse(
            {'status': 'error', 'message': 'An internal error has occurred!'}
        )


@csrf_exempt
def update_user(request):
    try:
        class_year = int(request.body)

        if (class_year > 2030) or (class_year < 2023):
            raise ValueError('Class year out of range')

        net_id = request.user.net_id
        user_inst = CustomUser.objects.get(net_id=net_id)
        user_inst.class_year = class_year
        user_inst.save()

        return JsonResponse(
            {'status': 'success', 'message': 'Class year updated successfully.'}
        )

    except Exception as e:
        # Log the detailed error internally
        logger.error(f'An internal error occurred: {e}', exc_info=True)

        # Return a generic error message to the user
        return JsonResponse(
            {'status': 'error', 'message': 'An internal error has occurred!'}
        )

# ----------------------------- CHECK REQUIREMENTS -----------------------------------#
def del_duplicates(li):
    res = []
    for x in li:
        if x not in res:
            res.append(x)
    return res

def settle_cleaning(d):
    for k, v in d.items():
        if isinstance(v, dict):
            if 'settled' in v.keys():
                print(v['settled'])
                print(type(v['settled']))
                print(del_duplicates(v['settled']))
                v['settled'] = del_duplicates(v['settled'])
            settle_cleaning(v)
    return d


def check_requirements(request):
    user_info = fetch_user_info(request.user)

    this_major = user_info['major']['code']
    these_minors = []
    for minor in user_info['minors']:
        these_minors.append(minor['code'])

    req_dict = check_user(user_info['netId'], user_info['major'],
                          user_info['minors'])

    print(req_dict)

    # Rewrite req_dict so that it is stratified by requirements being met
    formatted_dict = {}
    formatted_dict[this_major] =  req_dict[this_major]
    for minor in these_minors:
        formatted_dict[minor] = req_dict['Minors'][minor]

    # Clean Settled
    #print("this is clean")
    #cleaned = settle_cleaning(formatted_dict)
    #print(cleaned)

    return JsonResponse(formatted_dict)



       


