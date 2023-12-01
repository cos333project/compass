import os
import sys
import json
import yaml
import django
import logging
import collections
import time
import copy
from pathlib import Path

logging.basicConfig(level=logging.INFO)
sys.path.append(str(Path("../").resolve()))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
import constants
from config import django_init
from compass.models import Course, Department, Degree, Major, Minor, \
    Certificate, Requirement, CustomUser, UserCourses

DEFAULT_SCHEDULE = [[] for i in range(8)]

# Have a custom check_requirements recursive function for minors. Can
# return a huge dict that says how close to completion each minor is

# courses = [[{"inst" : something, "semester_number" : 1},
# {"id" : 72967, "semester_number" : 1}, ...], [], [], [], [], [], [], []]
# other fields: possible_reqs, reqs_satisfied, reqs_double_counted,
# num_settleable

# req is supposed to be the yaml data. Need a req dict to keep:
# req instance
# satisfied: whether the req is satisfied or not
# settled: courses that were settled to this req (course ids)
# unsettled: courses that were not settled to this req (course ids)
# req_list

# Is it better to keep reqs on the server (i.e. variable in this file)
# or is it better to have a UserRequirements table?

# Need a function that gets user id and creates courses matrix with
# everything that _init_courses has

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
        print(f"Current total time for {func.__name__}: {total_time} seconds")
        return result

    return wrapper


@cumulative_time
def check_user(net_id, major, minors):
    output = {}
    user_courses = create_courses(net_id)

    # get rid of this
    for sem in user_courses:
        for course in sem:
            if course['inst'].catalog_number == '217':
                course['settled'] = [2514]
            elif course['inst'].catalog_number == '216':
                course['settled'] = [2514]
            elif course['inst'].catalog_number == '218':
                course['settled'] = [2504]
            elif course['inst'].catalog_number == '219':
                course['settled'] = [2516]
            elif course['inst'].catalog_number == '326':
                course['settled'] = [2515]
            elif course['inst'].catalog_number == '520':
                course['settled'] = [2515]

    if major is not None:
        output[major['code']] = {}
        formatted_courses, formatted_req = \
            check_requirements("Major", major['code'], user_courses)
        # output[major['code']]['courses'] = formatted_courses
        output[major['code']]['requirements'] = formatted_req

    output['Minors'] = {}
    for minor in minors:
        output['Minors'][minor['code']] = {}
        formatted_courses, formatted_req = \
            check_requirements("Minor", minor['code'], user_courses)
        # output['minors'][minor['code']]['courses'] = formatted_courses
        output['Minors'][minor['code']]['requirements'] = formatted_req

    print(output['COS-AB'])

    return output


@cumulative_time
def create_courses(net_id):
    courses = DEFAULT_SCHEDULE
    course_insts = UserCourses.objects.select_related('user').filter(user__net_id=net_id)
    for course_inst in course_insts:
        courses[course_inst.semester - 1].append({"inst": course_inst.course})
    return courses


@cumulative_time
# course_dict is a dictionary containing course id: semester pairs.
def create_dummy_courses(course_dict):
    courses = DEFAULT_SCHEDULE
    for id in course_dict:
        courses[course_dict[id] - 1].append({"inst": Course.objects.get(id=id)})
    return courses


@cumulative_time
def check_requirements(table, code, courses):
    """
    Returns information about the requirements satisfied by the courses
    given in course_ids.

    :param table: the table containing the root of the requirement tree
    :param id: primary key in table
    :type req_file: string
    :type courses: 2D array of dictionaries.
    :returns: Whether the requirements are satisfied
    :returns: The list of courses with info about the requirements they satisfy
    :returns: A simplified json with info about how much of each requirement is satisfied
    :rtype: (bool, dict, dict)
    """
    if table == "Degree":
        req_inst = Degree.objects.get(code=code)
    elif table == "Major":
        req_inst = Major.objects.get(code=code)
    elif table == "Minor":
        req_inst = Minor.objects.get(code=code)
    elif table == "Certificate":
        req_inst = Certificate.objects.get(code=code)

    req = _init_req(req_inst)
    courses = _init_courses(courses)
    mark_possible_reqs(req, courses)
    assign_settled_courses_to_reqs(req, courses)
    add_course_lists_to_req(req, courses)
    formatted_courses = format_courses_output(courses)
    formatted_req = format_req_output(req)
    return formatted_courses, formatted_req


# These fields could be in the UserCourses table by default
# possible_reqs, reqs_satisfied, reqs_double_counted would be ManyToManyFields
@cumulative_time
def _init_courses(courses):
    if not courses:
        courses = DEFAULT_SCHEDULE
    else:
        courses = copy.deepcopy(courses)
    for sem in courses:
        for course in sem:
            course["possible_reqs"] = []
            course["reqs_satisfied"] = []
            course["reqs_double_counted"] = [] # reqs satisfied for which double counting allowed
            course["num_settleable"] = 0 # number of reqs to which can be settled. autosettled if 1
            if "settled" not in course or course["settled"] == None:
                course["settled"] = []
    return courses


# cache this: -2.5s. Also, do this at start up.
@cumulative_time
def _init_req(req_inst):
    req = {}
    req['inst'] = req_inst
    req['settled'] = []
    req['unsettled'] = []
    req['count'] = 0
    if req_inst.req_list.exists():
        req['req_list'] = []
        for sub_req_inst in req_inst.req_list.all():
            sub_req = _init_req(sub_req_inst)
            req['req_list'].append(sub_req)
    if (req["inst"]._meta.db_table == 'Requirement'):
        req['course_list'] = {course_inst.id for course_inst in req["inst"].course_list.all()}
        # req['exc_course_list'] = {course_inst.id for course_inst in req["inst"].excluded_course_list.all()}
        if len(req['course_list']) == 0:
            req.pop('course_list')
        # if len(req['exc_course_list']) == 0:
        #     req.pop('exc_course_list')
    return req


# Note: this function assumes that completed_by_semester only shows up
# in num_courses leaves. To make it more robust, update mark_all and
# mark_settled to only mark courses if they are completed in time.
@cumulative_time
def assign_settled_courses_to_reqs(req, courses):
    """
    Assigns only settled courses and those that can only satify one requirement,
    and updates the appropriate counts.
    """
    old_deficit = req["inst"].min_needed - req["count"]
    if (req["inst"].max_counted != None):
        old_available = req["inst"].max_counted - req["count"]

    was_satisfied = (old_deficit <= 0)
    newly_satisfied = 0
    if 'req_list' in req:
        for sub_req in req['req_list']:
            newly_satisfied += assign_settled_courses_to_reqs(sub_req, courses)
    elif req["inst"].double_counting_allowed:
        newly_satisfied = mark_all(req, courses)
    elif req["inst"].course_list.exists() or req["inst"].dept_list:
        newly_satisfied = mark_settled(req, courses)
    elif req["inst"].dist_req:
        newly_satisfied = mark_settled(req, courses)
    elif req["inst"].num_courses:
        newly_satisfied = check_degree_progress(req, courses)
    else:
        # for papers, IW, where there are no leaf nodes
        newly_satisfied = 1

    req["count"] += newly_satisfied
    new_deficit = req['inst'].min_needed - req['count']
    if (not was_satisfied) and (new_deficit <= 0):
        if req['inst'].max_counted == None:
            return req['count']
        else:
            return min(req['inst'].max_counted, req['count'])
    elif was_satisfied and (new_deficit <= 0):
        if req['inst'].max_counted == None:
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
    if "req_list" in req:
        for sub_req in req["req_list"]:
            mark_possible_reqs(sub_req, courses)
    else:
        if "course_list" in req or req["inst"].dept_list:
            mark_courses(req, courses)
        if req["inst"].dist_req:
            mark_dist(req, courses)


# This could be done in SQL
# In UserCourses, get courses where distribution_area_short in json.loads(req["inst"].dist_req)
# Do operations on search hits
@cumulative_time
def mark_dist(req, courses):
    num_marked = 0
    for sem in courses:
        for course in sem:
            if req["inst"].id in course["possible_reqs"]: # already used
                continue
            if course["inst"].distribution_area_short in json.loads(req["inst"].dist_req):
                num_marked += 1
                course["possible_reqs"].append(req["inst"].id)
                if not req["inst"].double_counting_allowed:
                    course["num_settleable"] += 1
    return num_marked


# This only assigns settleable requirements to courses, and not the
# other way around.
@cumulative_time
def mark_courses(req, courses):
    num_marked = 0
    for sem in courses:
        for course in sem:
            if req["inst"].id in course["possible_reqs"]: # already used
                continue
            if "exc_course_list" in req:
                if course["inst"].id in req["exc_course_list"]:
                    continue
            if req["inst"].dept_list:
                for code in json.loads(req["inst"].dept_list):
                    if code == course["inst"].department.code:
                        num_marked += 1
                        course["possible_reqs"].append(req["inst"].id)
                        if not req["inst"].double_counting_allowed:
                            course["num_settleable"] += 1
                        break
            if "course_list" in req:
                if course["inst"].id in req["course_list"]:
                    num_marked += 1
                    course["possible_reqs"].append(req["inst"].id)
                    if not req["inst"].double_counting_allowed:
                        course["num_settleable"] += 1
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
            if req["inst"].id in course["possible_reqs"]:
                num_marked += 1
                course["reqs_double_counted"].append(req["inst"].id)
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
            if len(course["reqs_satisfied"]) > 0: # already used in some subreq
                continue
            if len(course["settled"]) > 0:
                for p in course["settled"]: # go through the settled requirement ids
                    if (p == req["inst"].id) and (p in course["possible_reqs"]): # course was settled into this requirement
                        num_marked += 1
                        course["reqs_satisfied"].append(p)
                        break
            # or course is manually settled to this req...
            elif (course["num_settleable"] == 1) and (req["inst"].id in course["possible_reqs"]):
                num_marked += 1
                course["reqs_satisfied"].append(req["inst"].id)
                course["settled"].append(req["inst"].id)
    return num_marked


@cumulative_time
def check_degree_progress(req, courses):
    """
    Checks whether the correct number of courses have been completed by the
    end of semester number 'by_semester' (1-8)
    """
    by_semester = req["inst"].completed_by_semester
    num_courses = 0
    if by_semester == None or by_semester > len(courses):
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
    if "req_list" in req:
        for sub_req in req["req_list"]:
            add_course_lists_to_req(sub_req, courses)
    req["settled"] = []
    req["unsettled"] = []
    for sem in courses:
        for course in sem:
            if ((req["inst"]._meta.db_table == 'Requirement') and req["inst"].double_counting_allowed):
                if len(course["reqs_double_counted"]) > 0:
                    for req_id in course["reqs_double_counted"]:
                        if req_id == req["inst"].id:
                            if course["inst"].id not in req["settled"]:
                                req["settled"].append(course["inst"].id)
                            ## add to reqs_satisfied because couldn't be added in _assign_settled_courses_to_reqs()
                            course["reqs_satisfied"].append(req["inst"].id)
            elif len(course["settled"]) > 0:
                for req_id in course["settled"]:
                    if req_id == req["inst"].id:
                        if course["inst"].id not in req["settled"]:
                                req["settled"].append(course["inst"].id)
            else:
                for req_id in course["possible_reqs"]:
                    if req_id == req["inst"].id:
                        req["unsettled"].append(course["inst"].id)
                        break


@cumulative_time
def format_courses_output(courses):
    """
    Enforce the type and order of fields in the courses output
    """
    output = []
    for i, sem in enumerate(courses):
        output.append([])
        for j,course in enumerate(sem):
            output[i].append(collections.OrderedDict())
            for key in ["possible_reqs", "reqs_satisfied"]:
                output[i][j][key] = course[key]
            output[i][j]["name"] = course["inst"].title
            if len(course["settled"]) > 0: # only show if non-empty
                output[i][j]["settled"] = course["settled"]
    return output


@cumulative_time
def format_req_output(req):
    """
    Enforce the type and order of fields in the req output
    """
    output = collections.OrderedDict()
    # if (req["inst"]._meta.db_table != 'Requirement') and req["inst"].name:
    #     output['name'] = req["inst"].name
    if (req["inst"]._meta.db_table != 'Requirement') and req["inst"].code:
        output['code'] = req["inst"].code
    # if (req["inst"]._meta.db_table == 'Major') and req["inst"].degree.exists():
    #     output['degree'] = req['inst'].degree.all()[0]
    # if (req["inst"]._meta.db_table == 'Requirement') and req['inst'].pdfs_allowed:
    #     output['pdfs_allowed'] = str(req['inst'].pdfs_allowed)
    # if (req["inst"]._meta.db_table == 'Requirement') and req['inst'].completed_by_semester:
    #     output['completed_by_semester'] = str(req['inst'].completed_by_semester)
    if (req["inst"]._meta.db_table == 'Requirement') and req['inst'].name:
        output['name'] = req["inst"].name

    output["satisfied"] = str((req["inst"].min_needed - req["count"] <= 0))
    # output['count'] = str(req['count'])
    # output['min_needed'] = str(req['inst'].min_needed)
    # output['max_counted'] = str(req['inst'].max_counted)
    if "req_list" in req: # internal node. recursively call on children
        req_list = {}
        for subreq in req["req_list"]:
            child = format_req_output(subreq)
            if (child != None):
                if 'code' in child:
                    code = child.pop('code')
                    req_list[code] = child
                elif 'name' in child:
                    name = child.pop('name')
                    req_list[name] = child
        if req_list:
            output["req_list"] = req_list
    if "settled" in req:
        output["settled"] = str(req["settled"])
    # if "unsettled" in req:
    #     output["unsettled"] = str(req["unsettled"])
    return output

def main():
    # course_dict = {61511: 1, 2321: 1, 29481: 1, 2352: 1, 2113: 1,
    #                2303: 2, 7008: 2, 2207: 2, 2131: 2, 2133: 3}
    # course_dict = {29481: 1, 2113: 1, 2137: 1, 7008: 2, 2131: 2,
    #                2133: 3, 13483: 3}
    # courses = create_dummy_courses(course_dict)
    # for sem in courses:
    #     for course in sem:
    #         if course['inst'].catalog_number == '217':
    #             course['settled'] = [2514]
    #         elif course['inst'].catalog_number == '216':
    #             course['settled'] = [2514]
    #         elif course['inst'].catalog_number == '218':
    #             course['settled'] = [2504]
    #         elif course['inst'].catalog_number == '219':
    #             course['settled'] = [2516]
    #         elif course['inst'].catalog_number == '326':
    #             course['settled'] = [2515]
    #         elif course['inst'].catalog_number == '520':
    #             course['settled'] = [2515]
    # courses = _init_courses(courses)
    # print(courses)

    output = check_user('gc5512',
                        {'code': 'COS-AB', 'name': 'Computer Science - AB'},
                        [{'code': 'CLA', 'name': 'Classics'},
                         {'code': 'DAN', 'name': 'Dance'}])
    print(output['minors'])

if __name__ == "__main__":
    main()