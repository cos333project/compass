import os
import sys
import json
import yaml
import django
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
sys.path.append(str(Path("..").resolve()))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
import constants
from config import django_init
from compass.models import Course, Department, Degree, Major, Minor, Certificate, Requirement

DEGREE_FIELDS = ['name', 'code', 'description', 'urls']
MAJOR_FIELDS = ['name', 'code', 'description', 'urls']
MINOR_FIELDS = ['name', 'code', 'description', 'urls', 'apply_by_semester']
CERTIFICATE_FIELDS = ['name', 'code', 'description', 'urls', 'apply_by_semester', 'active_until']
REQUIREMENT_FIELDS = ['name', 'max_counted', 'min_needed', 'explanation', 'double_counting_allowed', 'max_common_with_major', 'pdfs_allowed', 'min_grade', 'completed_by_semester', 'dist_req', 'num_courses']


def load_data(yaml_file):
    logging.info("Loading yaml data...")
    with open(yaml_file, 'r') as file:
        data = yaml.safe_load(file) # this is a Python dict
        return data


def load_course_list(course_list):
    course_inst_list = []

    for course_code in course_list:
        if isinstance(course_code, dict):
            course_code = list(course_code.keys())[0]
        dept_code = course_code.replace('/', ' ').split(' ')[0]
        course_num = course_code.replace('/', ' ').split(' ')[1]

        try:
            dept_id = \
                Department.objects.get(code=dept_code).id
        except Department.DoesNotExist:
            logging.info(f"Dept with code {dept_code} not found")
            dept_id = None

        if not dept_id:
            continue

        if course_num == "*":
            course_inst_list += \
                Course.objects.filter(department_id=dept_id)
        elif "*" in course_num:
            course_inst_list += \
                Course.objects.filter(department_id=dept_id,
                                      catalog_number__startswith=
                                      course_num[0])
        else:
            course_inst_list += \
                Course.objects.filter(department_id=dept_id,
                                      catalog_number=course_num)

    return course_inst_list


def push_requirement(req):
    logging.info(f"{req['name']}")
    req_fields = {}
    for field in REQUIREMENT_FIELDS:
        if field in req:
            if field == 'min_needed':
                if req[field] == 'ALL':
                    if 'req_list' in req:
                        req_fields[field] = len(req['req_list'])
                    elif 'course_list' in req:
                        req_fields[field] = len(req['course_list'])
                elif req[field] == None:
                    continue
            elif field == 'max_counted':
                if req[field] == None:
                    continue
            elif field == 'dist_req':
                req_fields[field] = json.dumps(req[field])
            else:
                req_fields[field] = req[field]
    req_inst = Requirement.objects.create(**req_fields)

    if 'req_list' in req:
        for sub_req in req['req_list']:
            sub_req_inst = push_requirement(sub_req)
            req_inst.req_list.add(sub_req_inst)

    elif 'course_list' in req:
        course_inst_list = load_course_list(req['course_list'])
        for course_inst in course_inst_list:
            req_inst.course_list.add(course_inst)

    elif 'excluded_course_list' in req:
        course_inst_list = load_course_list(req['excluded_course_list'])
        for course_inst in course_inst_list:
            req_inst.excluded_course_list.add(course_inst)

    return req_inst


def push_degree(yaml_file):
    data = load_data(yaml_file)
    logging.info(f"{data['name']}")
    degree_fields = {}

    for field in DEGREE_FIELDS:
        if field in data:
            if field == 'urls':
                degree_fields[field] = json.dumps(data[field])
            else:
                degree_fields[field] = data[field]

    degree_inst = Degree.objects.create(**degree_fields)

    for req in data['req_list']:
        req_inst = push_requirement(req)
        degree_inst.req_list.add(req_inst)


def push_major(yaml_file):
    data = load_data(yaml_file)
    logging.info(f"{data['name']}")
    major_fields = {}

    for field in MAJOR_FIELDS:
        if field in data:
            if field == 'urls':
                major_fields[field] = json.dumps(data[field])
            else:
                major_fields[field] = data[field]

    major_inst = Major.objects.create(**major_fields)

    degree_code = ('AB' if major_inst.code in constants.AB_MAJORS
                   else 'BSE')
    try:
        degree_inst = Degree.objects.get(code=degree_code)
        major_inst.degree.add(degree_inst)
    except Degree.DoesNotExist:
        logging.info(f"Degree with code {degree_code} not found")

    for req in data['req_list']:
        req_inst = push_requirement(req)
        major_inst.req_list.add(req_inst)


def push_minor(yaml_file):
    data = load_data(yaml_file)
    logging.info(f"{data['name']}")
    minor_fields = {}

    for field in MINOR_FIELDS:
        if field in data:
            if field == 'urls':
                minor_fields[field] = json.dumps(data[field])
            else:
                minor_fields[field] = data[field]

    minor_inst = Minor.objects.create(**minor_fields)

    if 'excluded_majors' in data:
        for major_code in data['excluded_majors']:
            try:
                major_inst = Major.objects.get(code=major_code)
                minor_inst.excluded_majors.add(major_inst)
            except Major.DoesNotExist:
                logging.info(f"Major with code {major_code} not found")

    if 'excluded_minors' in data:
        for minor_code in data['excluded_minors']:
            try:
                other_minor_inst = Minor.objects.get(code=minor_code)
                minor_inst.excluded_minors.add(other_minor_inst)
            except Minor.DoesNotExist:
                logging.info(f"Minor with code {minor_code} not found")

    for req in data['req_list']:
        req_inst = push_requirement(req)
        minor_inst.req_list.add(req_inst)


def push_degrees(degrees_path):
    logging.info("Pushing degree requirements...")
    for file in degrees_path.glob("*.yaml"):
        push_degree(str(file))
    logging.info("Degree requirements pushed!")


def push_majors(majors_path):
    logging.info("Pushing major requirements...")
    for file in majors_path.glob("*.yaml"):
        push_major(str(file))
    logging.info("Major requirements pushed!")


def push_minors(minors_path):
    logging.info("Pushing minor requirements...")
    for file in minors_path.glob("*.yaml"):
        push_minor(str(file))
    logging.info("Minor requirements pushed!")


if __name__ == '__main__':
    push_degrees(Path("../degrees").resolve())
    # push_majors(Path("../majors").resolve())
    # push_minors(Path("../minors").resolve())
    push_major(Path("../majors/COS-AB.yaml").resolve())
    push_minor(Path("../minors/CLA.yaml").resolve())
