import os
import sys
import json
import yaml
import django
import logging
from pathlib import Path
from datetime import date

logging.basicConfig(level=logging.INFO)
sys.path.append(str(Path('../').resolve()))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
import constants
from compass.models import (
    Course,
    Department,
    Degree,
    Major,
    Minor,
    Certificate,
    Requirement,
)

from django.db import transaction

DEGREE_FIELDS = ['name', 'code', 'description', 'urls']
MAJOR_FIELDS = ['name', 'code', 'description', 'urls']
MINOR_FIELDS = ['name', 'code', 'description', 'urls', 'apply_by_semester']
CERTIFICATE_FIELDS = [
    'name',
    'code',
    'description',
    'urls',
    'apply_by_semester',
    'active_until',
]
REQUIREMENT_FIELDS = [
    'name',
    'max_counted',
    'min_needed',
    'explanation',
    'double_counting_allowed',
    'max_common_with_major',
    'pdfs_allowed',
    'min_grade',
    'completed_by_semester',
    'dept_list',
    'dist_req',
    'num_courses',
]
UNDECLARED = {'code': 'Undeclared', 'name': 'Undeclared'}


def load_data(yaml_file):
    logging.info('Loading yaml data...')
    with open(yaml_file, 'r') as file:
        data = yaml.safe_load(file)  # this is a Python dict
        return data


def load_course_list(course_list):
    course_inst_list = []
    dept_list = []

    for course_code in course_list:
        if isinstance(course_code, dict):
            course_code = list(course_code.keys())[0]
        dept_code = course_code.replace('/', ' ').split(' ')[0]
        course_num = course_code.replace('/', ' ').split(' ')[1]

        try:
            dept_id = Department.objects.get(code=dept_code).id
        except Department.DoesNotExist:
            logging.info(f'Dept with code {dept_code} not found')
            dept_id = None

        if not dept_id:
            continue

        if course_num in ['*', '***']:
            dept_list.append(dept_code)
        elif '*' in course_num:
            course_inst_list += Course.objects.filter(
                department_id=dept_id, catalog_number__startswith=course_num[0]
            )
        else:
            course_inst_list += Course.objects.filter(
                department_id=dept_id, catalog_number=course_num
            )
    return course_inst_list, dept_list


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
                elif req[field] is not None:
                    req_fields[field] = req[field]
                else:
                    continue
            elif field == 'max_counted':
                if req[field] is not None:
                    req_fields[field] = req[field]
                else:
                    continue
            elif field == 'dist_req':
                req_fields[field] = json.dumps(req[field])
            elif field == 'num_courses':
                req_fields[field] = req[field]
                req_fields['min_needed'] = req[field]
            else:
                req_fields[field] = req[field]
    req_inst = Requirement.objects.create(**req_fields)

    if ('req_list' in req) and (len(req['req_list']) != 0):
        for sub_req in req['req_list']:
            if 'double_counting_allowed' in req_fields:
                sub_req['double_counting_allowed'] = req_fields[
                    'double_counting_allowed'
                ]
            sub_req_inst = push_requirement(sub_req)
            sub_req_inst.parent = req_inst  # assign sub_req_inst as child of req_inst
            sub_req_inst.save()

    elif ('course_list' in req) and (len(req['course_list']) != 0):
        course_inst_list, dept_list = load_course_list(req['course_list'])
        for course_inst in course_inst_list:
            req_inst.course_list.add(course_inst)
        if len(dept_list) != 0:
            req_inst.dept_list = json.dumps(dept_list)
            req_inst.save()

    elif ('excluded_course_list' in req) and (len(req['excluded_course_list']) != 0):
        course_inst_list = load_course_list(req['excluded_course_list'])
        for course_inst in course_inst_list:
            req_inst.excluded_course_list.add(course_inst)

    elif (
        (('dist_req' not in req) or (req['dist_req'] == None))
        and (('num_courses' not in req) or (req['num_courses'] == None))
        and (('dept_list' not in req) or (req['dept_list'] == None))
    ):
        req_inst.max_counted = 1
        req_inst.min_needed = 0
        req_inst.save()

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

    degree_fields['min_needed'] = len(data['req_list'])
    degree_inst = Degree.objects.create(**degree_fields)

    for req in data['req_list']:
        req_inst = push_requirement(req)
        req_inst.degree = degree_inst
        req_inst.save()


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

    major_fields['min_needed'] = len(data['req_list'])
    major_inst = Major.objects.create(**major_fields)

    degree_code = 'AB' if major_inst.code in constants.AB_MAJORS else 'BSE'
    try:
        degree_inst = Degree.objects.get(code=degree_code)
        major_inst.degree.add(degree_inst)
    except Degree.DoesNotExist:
        logging.info(f'Degree with code {degree_code} not found')

    for req in data['req_list']:
        req_inst = push_requirement(req)
        req_inst.major = major_inst
        req_inst.save()


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

    minor_fields['min_needed'] = len(data['req_list'])
    minor_inst = Minor.objects.create(**minor_fields)

    if 'excluded_majors' in data:
        for major_code in data['excluded_majors']:
            try:
                major_inst = Major.objects.get(code=major_code)
                minor_inst.excluded_majors.add(major_inst)
            except Major.DoesNotExist:
                logging.info(f'Major with code {major_code} not found')

    if 'excluded_minors' in data:
        for minor_code in data['excluded_minors']:
            try:
                other_minor_inst = Minor.objects.get(code=minor_code)
                minor_inst.excluded_minors.add(other_minor_inst)
            except Minor.DoesNotExist:
                logging.info(f'Minor with code {minor_code} not found')

    for req in data['req_list']:
        req_inst = push_requirement(req)
        req_inst.minor = minor_inst
        req_inst.save()


def push_certificate(yaml_file):
    data = load_data(yaml_file)
    logging.info(f"{data['name']}")
    certificate_fields = {}

    for field in CERTIFICATE_FIELDS:
        if field in data:
            if field == 'urls':
                certificate_fields[field] = json.dumps(data[field])
            else:
                certificate_fields[field] = data[field]

    certificate_fields['min_needed'] = len(data['req_list'])
    certificate_fields['active_until'] = date(2025, 5, 1)
    certificate_inst = Certificate.objects.create(**certificate_fields)

    if 'excluded_majors' in data:
        for major_code in data['excluded_majors']:
            try:
                major_inst = Major.objects.get(code=major_code)
                certificate_inst.excluded_majors.add(major_inst)
            except Major.DoesNotExist:
                logging.info(f'Major with code {major_code} not found')

    for req in data['req_list']:
        req_inst = push_requirement(req)
        req_inst.certificate = certificate_inst
        req_inst.save()


def push_degrees(degrees_path):
    logging.info('Pushing degree requirements...')
    for file in degrees_path.glob('*.yaml'):
        push_degree(str(file))
    logging.info('Degree requirements pushed!')


def push_majors(majors_path):
    logging.info('Pushing major requirements...')
    for file in majors_path.glob('*.yaml'):
        push_major(str(file))
    logging.info('Major requirements pushed!')


def push_minors(minors_path):
    logging.info('Pushing minor requirements...')
    for file in minors_path.glob('*.yaml'):
        push_minor(str(file))
    logging.info('Minor requirements pushed!')


def push_certificates(certificates_path):
    logging.info('Pushing certificate requirements...')
    for file in certificates_path.glob('*.yaml'):
        push_certificate(str(file))
    logging.info('Certificate requirements pushed!')
    
# TODO: This should create or update so we don't have duplicates in the database, also with atomicity too
if __name__ == '__main__':
    with transaction.atomic():
        # push_degrees(Path('../degrees').resolve())
        # push_majors(Path('../majors').resolve())
        # push_major(Path('../majors/COS-AB.yaml').resolve())
        # push_major(Path('../majors/COS-BSE.yaml').resolve())
        # push_major(Path('../majors/ECO.yaml').resolve())
        # push_major(Path('../majors/ORF.yaml').resolve())
        # push_major(Path('../majors/COS-BSE.yaml').resolve())
        # push_major(Path('../majors/MAE.yaml').resolve())
        # push_minors(Path('../minors').resolve())
        # push_minors(Path('../certificates').resolve())

        # push_certificate(Path("../certificates/AAS.yaml").resolve())

        # push_minor(Path('../minors/CLA.yaml').resolve())
        # push_minor(Path('../minors/DAN.yaml').resolve())
        # push_minor(Path('../minors/CHI.yaml').resolve())
        # push_minor(Path('../minors/CS.yaml').resolve())
        # push_minor(Path('../minors/MQE.yaml').resolve())
        # push_minor(Path('../minors/FIN.yaml').resolve())        

        # Push Undeclared major into database
        # Major.objects.create(UNDECLARED)
