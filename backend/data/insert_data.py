import csv
import logging
import os
import sys
from datetime import datetime
from pathlib import Path

import django
from django.db import transaction
from compass.models import (
    Department,
    AcademicTerm,
    Course,
    CourseEquivalent,
    Section,
    ClassMeeting,
    ClassYearEnrollment,
    Instructor,
)

logging.basicConfig(level=logging.INFO)

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# -------------------------------------------------------------------------------------#


# -------------------------------------------------------------------------------------#

filename = input('Enter the name of the CSV file (without extension): ')
relative_path = Path(f'../data/{filename}.csv')

if not relative_path.exists():
    print(f'The file {filename}.csv does not exist in the data directory.')
    sys.exit(1)

abs_path = relative_path.resolve()

# -------------------------------------------------------------------------------------#


def insert_department(rows):
    logging.info('Starting Department insertions...')

    # Extract unique departments based on code and name
    unique_departments = {(row['Subject Code'], row['Subject Name']) for row in rows}

    new_departments = [
        Department(code=code, name=name)
        for code, name in unique_departments
        if not Department.objects.filter(code=code).exists()
    ]

    # Bulk create new departments
    Department.objects.bulk_create(new_departments)

    logging.info('Department insertions completed!')


# -------------------------------------------------------------------------------------#


def insert_academic_term(rows):
    logging.info('Starting AcademicTerm insertions...')

    def parse_date(date_str):
        return datetime.strptime(date_str, '%Y-%m-%d').date()

    # Extract unique academic terms based on term_code and suffix
    unique_terms = {
        (
            int(row['Term Code'].strip()),
            row['Term Name'],
            parse_date(row['Term Start Date']),
            parse_date(row['Term End Date']),
        )
        for row in rows
    }

    # Create new AcademicTerm objects
    new_terms = [
        AcademicTerm(
            term_code=term_code, suffix=suffix, start_date=start_date, end_date=end_date
        )
        for term_code, suffix, start_date, end_date in unique_terms
    ]

    # Bulk create new academic terms
    AcademicTerm.objects.bulk_create(new_terms)
    logging.info('AcademicTerm insertion completed!')


# -------------------------------------------------------------------------------------#


def insert_course(rows):
    logging.info('Starting Course insertions...')

    # Fetch all departments and store in a dictionary for quick access
    departments = {dept.code: dept for dept in Department.objects.all()}

    new_courses = []
    for row in rows:
        course_id = row['Course ID']
        dept_code = row['Subject Code']
        title = row['Course Title']
        catalog_number = row['Catalog Number']

        department = departments.get(dept_code)
        if not department:
            logging.warning(f'Department with code {dept_code} not found!')
            continue

        if not Course.objects.filter(course_id=course_id).exists():
            course = Course(
                course_id=course_id,
                department=department,
                title=title,
                catalog_number=catalog_number,
                description=row.get('Course Description'),
                drop_consent=row.get('Drop Consent'),
                add_consent=row.get('Add Consent'),
                web_address=row.get('Web Address'),
                pu_flag=row.get('PU Flag'),
                transcript_title=row.get('Transcript Title'),
                long_title=row.get('Long Title'),
                distribution_area_long=row.get('Distribution Area Long'),
                distribution_area_short=row.get('Distribution Area Short'),
                reading_writing_assignment=row.get('Reading Writing Assignment'),
                grading_basis=row.get('Grading Basis'),
                reading_list=row.get('Reading List'),
            )
            new_courses.append(course)

    Course.objects.bulk_create(new_courses)
    logging.info('Course insertion completed!')


# -------------------------------------------------------------------------------------#


def insert_course_equivalent(rows):
    logging.info('Starting CourseEquivalent insertion...')

    new_equivalents = []
    for row in rows:
        primary_course_id = int(row['Course ID'].strip())
        equivalent_subject = row['Crosslisting Subjects']
        equivalent_catalog_number = row['Crosslisting Catalog Numbers']

        # Fetch primary course and equivalent course
        try:
            primary_course = Course.objects.get(course_id=primary_course_id)
            equivalent_course = Course.objects.get(
                department__code=equivalent_subject,
                catalog_number=equivalent_catalog_number,
            )
        except Course.DoesNotExist:
            logging.warning(
                f'Course not found for Course ID: {primary_course_id} or Crosslisting: {equivalent_subject} {equivalent_catalog_number}'
            )
            continue

        # Check if this equivalence already exists
        if not CourseEquivalent.objects.filter(
            primary_course=primary_course, equivalent_course=equivalent_course
        ).exists():
            new_equivalent = CourseEquivalent(
                primary_course=primary_course, equivalent_course=equivalent_course
            )
            new_equivalents.append(new_equivalent)

    # Bulk create new course equivalents
    CourseEquivalent.objects.bulk_create(new_equivalents)
    logging.info('CourseEquivalent insertion completed!')


# -------------------------------------------------------------------------------------#


def insert_section(rows):
    logging.info('Starting Section insertions...')

    new_sections = []
    for row in rows:
        course_id = int(row['Course ID'].strip())
        term_code = int(row['Term Code'].strip())
        class_number = row['Class Number']

        # Fetch or create the instructor, if provided
        instructor_emplid = row.get('Instructor EmplID', '').strip()
        instructor_first_name = row.get('Instructor First Name', '').strip()
        instructor_last_name = row.get('Instructor Last Name', '').strip()
        instructor_full_name = f'{instructor_first_name} {instructor_last_name}'

        instructor_obj = None
        if instructor_emplid:
            instructor_obj, _ = Instructor.objects.get_or_create(
                emplid=instructor_emplid,
                defaults={
                    'first_name': instructor_first_name,
                    'last_name': instructor_last_name,
                    'full_name': instructor_full_name,
                },
            )

        if not Section.objects.filter(
            course__course_id=course_id,
            term__term_code=term_code,
            class_number=class_number,
        ).exists():
            section = Section(
                course=Course.objects.get(course_id=course_id),
                class_number=class_number,
                class_type=row.get('Class Type', ''),
                class_section=row.get('Class Section', ''),
                term=AcademicTerm.objects.get(term_code=term_code),
                track=row.get('Course Track', '').strip(),
                seat_reservations=row.get('Class Year Enrollments', '').strip(),
                instructor=instructor_obj,
                capacity=int(row.get('Class Capacity', 0)),
                status=row.get('Class Status', ''),
                enrollment=int(row.get('Class Enrollment', 0)),
            )
            new_sections.append(section)

    Section.objects.bulk_create(new_sections)
    logging.info('Section insertion completed!')


# -------------------------------------------------------------------------------------#


def insert_class_year_enrollment(rows):
    logging.info('Starting ClassYearEnrollment insertions...')

    new_enrollments = []
    for row in rows:
        course_id = int(row['Course ID'].strip())
        term_code = int(row['Term Code'].strip())
        class_number = row['Class Number']
        class_section = row['Class Section']
        class_year = int(row['Class Year'])
        enrl_seats = int(row['Enrollment Seats'])

        try:
            section = Section.objects.get(
                course__course_id=course_id,
                term__term_code=term_code,
                class_number=class_number,
            )
        except Section.DoesNotExist:
            logging.warning(
                f'Section not found for Course ID: {course_id}, Term Code: {term_code}, Class Section: {class_section}'
            )
            continue

        if not ClassYearEnrollment.objects.filter(
            section=section, class_year=class_year
        ).exists():
            enrollment = ClassYearEnrollment(
                section=section, class_year=class_year, enrl_seats=enrl_seats
            )
            new_enrollments.append(enrollment)

    ClassYearEnrollment.objects.bulk_create(new_enrollments)
    logging.info('ClassYearEnrollment insertion completed!')


# -------------------------------------------------------------------------------------#


def insert_class_meeting(rows):
    logging.info('Starting ClassMeeting insertions...')

    def parse_time(time_str):
        return datetime.strptime(time_str, '%H:%M').time()

    new_meetings = []
    for row in rows:
        course_id = int(row['Course ID'].strip())
        term_code = int(row['Term Code'].strip())
        # class_type = row['Class Type']
        class_section = row['Class Section']
        meeting_number = int(row['Meeting Number'].strip())

        # Fetch the section
        try:
            section = Section.objects.get(
                course__course_id=course_id,
                term__term_code=term_code,
                class_section=class_section,
            )
        except Section.DoesNotExist:
            logging.warning(
                f'Section not found for Course ID: {course_id}, Term Code: {term_code}, Class Section: {class_section}'
            )
            continue

        if not ClassMeeting.objects.filter(
            section=section, meeting_number=meeting_number
        ).exists():
            meeting = ClassMeeting(
                section=section,
                meeting_number=meeting_number,
                start_time=parse_time(row['Meeting Start Time']),
                end_time=parse_time(row['Meeting End Time']),
                room=row.get('Meeting Room', '').strip(),
                days=row.get('Meeting Days', '').strip(),
                building_name=row.get('Building Name', '').strip(),
            )
            new_meetings.append(meeting)

    ClassMeeting.objects.bulk_create(new_meetings)
    logging.info('ClassMeeting insertion completed!')


# -------------------------------------------------------------------------------------#

if __name__ == '__main__':
    # Read CSV into list of rows
    with abs_path.open('r') as file:
        reader = csv.DictReader(file)
        rows = [row for row in reader]

    # Trim the column names
    trimmed_rows = [
        {key.strip(): value.strip() for key, value in row.items()} for row in rows
    ]

    try:
        with transaction.atomic():
            insert_department(trimmed_rows)
        # with transaction.atomic():
        #     insert_academic_term(trimmed_rows)
        with transaction.atomic():
            insert_course(trimmed_rows)
        with transaction.atomic():
            insert_section(trimmed_rows)
        with transaction.atomic():
            insert_class_meeting(trimmed_rows)
        with transaction.atomic():
            insert_class_year_enrollment(trimmed_rows)
        with transaction.atomic():
            insert_course_equivalent(trimmed_rows)

    except Exception as e:
        logging.error(f'Transaction failed: {e}')
