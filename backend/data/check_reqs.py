import os
import sys
import ujson as json
import django
import logging
import collections
import time
import copy
from pathlib import Path
from django.db.models import Prefetch

logging.basicConfig(level=logging.INFO)
sys.path.append(str(Path('../').resolve()))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from compass.models import (
    Course,
    Department,
    Degree,
    Major,
    Minor,
    Certificate,
    UserCourses,
    Requirement,
    CourseComments,
    CourseEvaluations,
)


# Django model instances are cached so this should be at least as
# efficient as TigerPath code


def cumulative_time(func):
    total_time = 0

    def wrapper(*args, **kwargs):
        nonlocal total_time
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        total_time += end_time - start_time
        return result

    return wrapper


@cumulative_time
def check_user(net_id, major, minors):
    output = {}
    user_courses = create_courses(net_id)

    if major is not None:
        major_code = major['code']
        output[major_code] = {}

        if major_code != 'Undeclared':
            formatted_req = check_requirements('Major', major_code,
                                               user_courses)
        else:
            formatted_req = {'code': 'Undeclared', 'satisfied': True}
        output[major_code]['requirements'] = formatted_req

    output['Minors'] = {}
    for minor in minors:
        minor = minor['code']
        output['Minors'][minor] = {}
        formatted_req = check_requirements('Minor', minor, user_courses)
        output['Minors'][minor]['requirements'] = formatted_req

    return output


@cumulative_time
def create_courses(net_id):
    courses = [[] for i in range(8)]
    course_insts = UserCourses.objects.select_related('user').filter(
        user__net_id=net_id
    )
    for course_inst in course_insts:
        course = {'inst': course_inst.course, 'id': course_inst.id, 'manually_settled': False}
        if course_inst.requirement_id is not None:
            course['settled'] = [course_inst.requirement_id]
            course['manually_settled'] = True
        courses[course_inst.semester - 1].append(course)
    return courses


@cumulative_time
def check_requirements(table, code, courses):
    if table == 'Degree':
        req_inst = Degree.objects.prefetch_related(
            Prefetch('req_list',
                     queryset=Requirement.objects.prefetch_related(
                         Prefetch('req_list',
                                  queryset=Requirement.objects.all())
                     ))).get(code=code)
    elif table == 'Major':
        req_inst = Major.objects.prefetch_related(
            Prefetch('req_list',
                     queryset=Requirement.objects.prefetch_related(
                         Prefetch('req_list',
                                  queryset=Requirement.objects.all()),
                         'course_list'
                     ))).get(code=code)
    elif table == 'Minor':
        req_inst = Minor.objects.prefetch_related(
            Prefetch('req_list',
                     queryset=Requirement.objects.prefetch_related(
                         Prefetch('req_list',
                                  queryset=Requirement.objects.all()),
                         'course_list'
                     ))).get(code=code)
    elif table == 'Certificate':
        req_inst = Certificate.objects.prefetch_related(
            Prefetch('req_list',
                     queryset=Requirement.objects.prefetch_related(
                         Prefetch('req_list',
                                  queryset=Requirement.objects.all()),
                         'course_list'
                     ))).get(code=code)

    req = _init_req(req_inst)
    courses = _init_courses(courses)
    mark_possible_reqs(req, courses)
    assign_settled_courses_to_reqs(req, courses)
    add_course_lists_to_req(req, courses)
    # formatted_courses = format_courses_output(courses)
    formatted_req = format_req_output(req, courses)
    return formatted_req


@cumulative_time
def _init_courses(courses):
    if not courses:
        courses = [[] for i in range(8)]
    else:
        courses = copy.deepcopy(courses)
    for sem in courses:
        for course in sem:
            course['possible_reqs'] = []
            course['reqs_satisfied'] = []
            course[
                'reqs_double_counted'
            ] = []  # reqs satisfied for which double counting allowed
            course[
                'num_settleable'
            ] = 0  # number of reqs to which can be settled. autosettled if 1
            if 'settled' not in course or course['settled'] is None:
                course['settled'] = []
    return courses


# cache this: -2.5s. Also, do this at start up.
@cumulative_time
def _init_req(req_inst):
    req = {
        'inst': req_inst,
        'id': req_inst.id,
        'settled': [],
        'unsettled': [],
        'count': 0
    }
    if hasattr(req_inst,
               '_prefetched_objects_cache') and 'req_list' in req_inst._prefetched_objects_cache:
        sub_reqs = req_inst._prefetched_objects_cache['req_list']
    else:
        sub_reqs = req_inst.req_list.all()

    if sub_reqs:
        req['req_list'] = [_init_req(sub_req_inst) for sub_req_inst in
                           sub_reqs]

    if req['inst']._meta.db_table == 'Requirement':
        if hasattr(req_inst,
                   '_prefetched_objects_cache') and 'course_list' in req_inst._prefetched_objects_cache:
            courses = req_inst._prefetched_objects_cache['course_list']
        else:
            courses = req_inst.course_list.all()

        req['course_list'] = {course_inst.id for course_inst in courses}

        if len(req['course_list']) == 0:
            req.pop('course_list')
        # req['exc_course_list'] = {course_inst.id for course_inst in req["inst"].excluded_course_list.all()}
        # if len(req['exc_course_list']) == 0:
        #     req.pop('exc_course_list')
        # req['completed_by_semester'] = req_inst.completed_by_semester
    return req


@cumulative_time
def assign_settled_courses_to_reqs(req, courses):
    """
    Assigns only settled courses and those that can only satify one requirement,
    and updates the appropriate counts.
    """

    old_deficit = req['inst'].min_needed - req['count']
    if req['inst'].max_counted is not None:
        old_available = req['inst'].max_counted - req['count']

    was_satisfied = old_deficit <= 0
    newly_satisfied = 0
    if 'req_list' in req:
        for sub_req in req['req_list']:
            newly_satisfied += assign_settled_courses_to_reqs(sub_req,
                                                              courses)
    elif req['inst'].double_counting_allowed:
        newly_satisfied = mark_all(req, courses)
    elif req['inst'].course_list.exists() or req['inst'].dept_list:
        newly_satisfied = mark_settled(req, courses)
    elif req['inst'].dist_req:
        newly_satisfied = mark_settled(req, courses)
    elif req['inst'].num_courses:
        newly_satisfied = check_degree_progress(req, courses)
    else:
        # for papers, IW, where there are no leaf nodes
        newly_satisfied = 1

    req['count'] += newly_satisfied
    new_deficit = req['inst'].min_needed - req['count']
    if (not was_satisfied) and (new_deficit <= 0):
        if req['inst'].max_counted is None:
            return req['count']
        else:
            return min(req['inst'].max_counted, req['count'])
    elif was_satisfied and (new_deficit <= 0):
        if req['inst'].max_counted is None:
            return newly_satisfied
        else:
            return min(old_available, newly_satisfied)
    else:
        return 0


@cumulative_time
def mark_possible_reqs(req, courses):
    """
    Finds all the requirements that each course can satisfy.
    """
    if 'req_list' in req:
        for sub_req in req['req_list']:
            mark_possible_reqs(sub_req, courses)
    else:
        if 'course_list' in req or req['inst'].dept_list:
            mark_courses(req, courses)
        if req['inst'].dist_req:
            mark_dist(req, courses)


# This could be done in SQL
# In UserCourses, get courses where distribution_area_short in json.loads(req["inst"].dist_req)
# Do operations on search hits
@cumulative_time
def mark_dist(req, courses):
    num_marked = 0
    for sem in courses:
        for course in sem:
            if req['id'] in course['possible_reqs']:  # already used
                continue
            if course['inst'].distribution_area_short in json.loads(
                    req['inst'].dist_req
            ):
                num_marked += 1
                course['possible_reqs'].append(req['id'])
                if not req['inst'].double_counting_allowed:
                    course['num_settleable'] += 1
    return num_marked


# This only assigns settleable requirements to courses, and not the
# other way around.
@cumulative_time
def mark_courses(req, courses):
    num_marked = 0
    for sem in courses:
        for course in sem:
            if req['id'] in course['possible_reqs']:  # already used
                continue
            # if 'exc_course_list' in req:
            #     if course['inst'].id in req['exc_course_list']:
            #         continue
            if req['inst'].dept_list:
                for code in json.loads(req['inst'].dept_list):
                    if code == course['inst'].department.code:
                        num_marked += 1
                        course['possible_reqs'].append(req['id'])
                        if not req['inst'].double_counting_allowed:
                            course['num_settleable'] += 1
                        break
            if 'course_list' in req:
                if course['id'] in req['course_list']:
                    num_marked += 1
                    course['possible_reqs'].append(req['id'])
                    if not req['inst'].double_counting_allowed:
                        course['num_settleable'] += 1
    return num_marked


@cumulative_time
def mark_all(req, courses):
    """
    Finds and marks all courses in 'courses' that satisfy a requirement where
    double counting is allowed.
    """
    num_marked = 0
    for sem in courses:
        for course in sem:
            if req['id'] in course['possible_reqs']:
                num_marked += 1
                course['reqs_double_counted'].append(req['id'])
    return num_marked


@cumulative_time
def mark_settled(req, courses):
    """
    Finds and marks all courses in 'courses' that have been settled to
    this requirement.
    """
    num_marked = 0
    for sem in courses:
        for course in sem:
            if len(course[
                       'reqs_satisfied']) > 0:  # already used in some subreq
                continue
            if len(course['settled']) > 0:
                for p in course[
                    'settled']:  # go through the settled requirement ids
                    if (p == req['id']) and (
                            p in course['possible_reqs']
                    ):  # course was settled into this requirement
                        num_marked += 1
                        course['reqs_satisfied'].append(p)
                        break
            # or course is manually settled to this req...
            elif (course['num_settleable'] == 1) and (
                    req['id'] in course['possible_reqs']
            ):
                num_marked += 1
                course['reqs_satisfied'].append(req['id'])
                course['settled'].append(req['id'])
    return num_marked


@cumulative_time
def check_degree_progress(req, courses):
    """
    Checks whether the correct number of courses have been completed by the
    end of semester number 'by_semester' (1-8)
    """
    by_semester = req['completed_by_semester']
    num_courses = 0
    if by_semester is None or by_semester > len(courses):
        by_semester = len(courses)
    for i in range(by_semester):
        num_courses += len(courses[i])
    return num_courses


@cumulative_time
def add_course_lists_to_req(req, courses):
    """
    Add course lists for each requirement that either
    (a) has no subrequirements, or
    (b) has hidden subrequirements
    """
    if 'req_list' in req:
        for sub_req in req['req_list']:
            add_course_lists_to_req(sub_req, courses)
    req['settled'] = []
    req['unsettled'] = []
    for sem in courses:
        for course in sem:
            if (req['inst']._meta.db_table == 'Requirement') and req[
                'inst'
            ].double_counting_allowed:
                if len(course['reqs_double_counted']) > 0:
                    for req_id in course['reqs_double_counted']:
                        if req_id == req['id']:
                            req['settled'].append(course['id'])
                            ## add to reqs_satisfied because couldn't be added in _assign_settled_courses_to_reqs()
                            course['reqs_satisfied'].append(req['id'])
            elif len(course['settled']) > 0:
                for req_id in course['settled']:
                    if req_id == req['id']:
                        req['settled'].append(course['id'])
            else:
                for req_id in course['possible_reqs']:
                    if req_id == req['id']:
                        req['unsettled'].append(course['id'])
                        break


@cumulative_time
def format_req_output(req, courses):
    """
    Enforce the type and order of fields in the req output
    """
    output = collections.OrderedDict()
    if (req['inst']._meta.db_table != 'Requirement') and req[
        'inst'].code:
        output['code'] = req['inst'].code
    if (req['inst']._meta.db_table == 'Requirement') and req[
        'inst'].name:
        output['name'] = req['inst'].name
    output['req_id'] = req['id']
    output['satisfied'] = str(
        (req['inst'].min_needed - req['count'] <= 0))
    output['count'] = str(req['count'])
    output['min_needed'] = str(req['inst'].min_needed)
    output['max_counted'] = req['inst'].max_counted
    if 'req_list' in req:  # internal node. recursively call on children
        req_list = {}
        for i, subreq in enumerate(req['req_list']):
            child = format_req_output(subreq, courses)
            if child is not None:
                if 'code' in child:
                    code = child.pop('code')
                    req_list[code] = child
                elif 'name' in child:
                    name = child.pop('name')
                    req_list[name] = child
                else:
                    req_list[f'Subrequirement {i + 1}'] = child
        if req_list:
            output['subrequirements'] = req_list
    if ('settled' in req) and ('req_list' not in req):
        settled = []
        for semester in courses:
            for course in semester:
                if course['id'] in req['settled']:
                    course_output = {
                        'code': course['inst'].department.code
                                + ' '
                                + course['inst'].catalog_number,
                        'id': course['id'],
                        'manually_settled': course['manually_settled'],
                    }
                    settled.append(course_output)
        output['settled'] = [settled, req['id']]
    if ('unsettled' in req) and ('req_list' not in req):
        unsettled = []
        for semester in courses:
            for course in semester:
                if course['id'] in req['unsettled']:
                    course_output = {
                        'code': course['inst'].department.code
                                + ' '
                                + course['inst'].catalog_number,
                        'id': course['id'],
                        'manually_settled': course['manually_settled'],
                    }
                    unsettled.append(course_output)
        output['unsettled'] = [unsettled, req['id']]
    return output


# ---------------------------- FETCH COURSE COMMENTS ----------------------------------#


# dept is the department code (string) and num is the catalog number (int)
# returns dictionary containing relevant info
def get_course_comments(dept, num):
    dept = str(dept)
    num = str(num)
    try:
        dept_code = Department.objects.filter(code=dept).first().id
        try:
            this_course_id = (
                Course.objects.filter(department__id=dept_code,
                                      catalog_number=num)
                .first()
                .guid
            )
            this_course_id = this_course_id[4:]
            try:
                comments = list(
                    CourseComments.objects.filter(
                        course_guid__endswith=this_course_id)
                )
                li = []
                for commentobj in comments:
                    if 2 <= len(commentobj.comment) <= 2000:
                        li.append(commentobj.comment)
                li = list(dict.fromkeys(li))
                cleaned_li = []
                for element in li:
                    element = element.replace('\\"', '"')
                    element = element.replace('it?s', "it's")
                    element = element.replace('?s', "'s")
                    element = element.replace('?r', "'r")
                    if element[0] == '[' and element[
                        len(element) - 1] == ']':
                        element = element[1: len(element) - 1]

                    cleaned_li.append(element)

                dictresult = {}
                dictresult['reviews'] = cleaned_li

                try:
                    quality_of_course = (
                        CourseEvaluations.objects.filter(
                            course_guid__endswith=this_course_id
                        )
                        .first()
                        .quality_of_course
                    )
                    dictresult['rating'] = quality_of_course

                except CourseEvaluations.DoesNotExist:
                    return dictresult

                return dictresult

            except CourseComments.DoesNotExist:
                return None
        except Course.DoesNotExist:
            return None
    except Department.DoesNotExist:
        return None


# ---------------------------- FETCH COURSE DETAILS -----------------------------------#


# dept is the department code (string) and num is the catalog number (int)
# returns dictionary containing relevant info
def get_course_info(dept, num):
    dept = str(dept)
    num = str(num)

    try:
        dept_code = Department.objects.filter(code=dept).first().id
        try:
            course = Course.objects.filter(
                department__id=dept_code, catalog_number=num
            ).first()
            if course.course_id:
                co_id = course.course_id
            # get relevant info and put it in a dictionary
            course_dict = {}
            if course.title:
                course_dict['Title'] = course.title
            if course.description:
                course_dict['Description'] = course.description
            if course.distribution_area_short:
                course_dict[
                    'Distribution Area'] = course.distribution_area_short
            # if instructor:
            #    course_dict["Professor"] = instructor
            if course.reading_list:
                clean_reading_list = course.reading_list
                clean_reading_list = clean_reading_list.replace('//',
                                                                ', by ')
                clean_reading_list = clean_reading_list.replace(';',
                                                                '; ')
                course_dict['Reading List'] = clean_reading_list
            if course.reading_writing_assignment:
                course_dict[
                    'Reading / Writing Assignments'
                ] = course.reading_writing_assignment
            if course.grading_basis:
                course_dict['Grading Basis'] = course.grading_basis
            return course_dict

        except Course.DoesNotExist:
            return None
    except Course.DoesNotExist:
        return None


# ---------------------------- FETCH REQUIREMENT INFO -----------------------------------#


def fetch_requirement_info(req_id):
    try:
        explanation = Requirement.objects.get(id=req_id)
        explanation = explanation.explanation
    except Course.DoesNotExist:
        explanation = ''

    try:
        course_list = Requirement.objects.get(id=req_id)
        course_list = course_list.course_list.all()
        satisfying_courses = []
        for course in course_list:
            satisfying_courses.append(
                f'{course.department.code} {course.catalog_number}'
            )
    except Course.DoesNotExist:
        satisfying_courses = []

    info = {}
    info[0] = explanation
    info[1] = satisfying_courses

    return info


def main():
    pass


if __name__ == '__main__':
    main()
