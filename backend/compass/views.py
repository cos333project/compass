import logging
import re

from django.contrib.auth.decorators import login_required
from django.db.models import Case, Q, Value, When
from django.http import JsonResponse
from django.views import View
from .models import Course, CustomUser, models, UserCourses
from django.views.decorators.csrf import csrf_exempt
from .models import Course, CustomUser, models
from .serializers import CourseSerializer
import ujson as json
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)

# ------------------------------------ PROFILE ----------------------------------------#


def fetch_user_info(user):
    return {
        'net_id': getattr(user, 'net_id', None),
        'university_id': getattr(user, 'university_id', None),
        'email': getattr(user, 'email', None),
        'first_name': getattr(user, 'first_name', None),
        'last_name': getattr(user, 'last_name', None),
        'class_year': getattr(user, 'class_year', None),
        'department' : getattr(user, 'department', None),
        'puresidentdepartment' : getattr(user, 'puresidentdepartment', None),
        'campusid' : getattr(user, 'campusid', None)
    }


@login_required
def profile(request):
    user_info = fetch_user_info(request.user)
    return JsonResponse(user_info)


@login_required
def update_profile(request):
    # TODO: Validate this stuff
    # Assuming the request data is sent as JSON
    data = request.JSON

    # Validate and extract the new fields
    new_first_name = data.get('firstName', '')
    new_last_name = data.get('lastName', '')
    new_major = data.get('major', '')
    new_minors = data.get('minors', '')  # Assuming minors is a comma-separated string

    # Fetch the user's profile
    user_profile = CustomUser.objects.get(user=request.user)

    # Update the fields
    user_profile.first_name = new_first_name
    user_profile.last_name = new_last_name
    user_profile.major = new_major
    user_profile.minors = new_minors.split(',')  # Split the string into a list
    user_profile.save()

    # Fetch updated user info (assuming this function exists and returns a dict)
    updated_user_info = fetch_user_info(request.user)
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
NUM_DEPT_REGEX = re.compile(r'^\d{1,3}[a-zA-Z]{1,3}$', re.IGNORECASE)
DEPT_ONLY_REGEX = re.compile(r'^[a-zA-Z]{1,3}$', re.IGNORECASE)
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
            elif NUM_DEPT_REGEX.match(trimmed_query):
                result = re.split(r'([a-zA-Z]+)', string=trimmed_query, maxsplit=1)
                dept = result[1]
                num = result[0]
            elif DEPT_ONLY_REGEX.match(trimmed_query):
                dept = trimmed_query
                num = ''
                # title = query.strip()
            elif NUM_ONLY_REGEX.match(trimmed_query):
                dept = ''
                num = trimmed_query
            else:
                dept = ''
                num = ''
                # title = query.strip()

            try:
                exact_match_course = Course.objects.select_related('department').filter(
                    Q(department__code__iexact=dept) & Q(catalog_number__iexact=num)
                )
                if exact_match_course:
                    # If an exact match is found, return only that course
                    serialized_course = CourseSerializer(exact_match_course, many=True)
                    return JsonResponse({'courses': serialized_course.data})
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


# ---------------------------- UPDATE USER COURSES -----------------------------------#

@csrf_exempt
def update_user_class_year(request):
    try:
        class_year = int(request.body)
        print(class_year)
        user = request.user
        print(user)

        # get user instance from db, update class_year field

        return JsonResponse(
            {'status': 'success', 'message': 'Class year updated successfully.'}
        )

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})

# def parse_semester(semester_id):
#     season = semester_id.split(' ')[0]
#     year = int(semester_id.split(' ')[1])


@csrf_exempt
def update_user_courses(request):
    try:
        data = json.loads(request.body)
        course_id = data.get('courseId')  # might have to adjust this, print
        print(data)
        semester_id = data.get('semesterId')
        user = request.user

        UserCourses.objects.update_or_create(
            user=user,
            course_id=course_id,
            defaults={
                'semester_id': semester_id,
            },
        )
        return JsonResponse(
            {'status': 'success', 'message': 'Course updated successfully.'}
        )

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})
