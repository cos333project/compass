import csv
import logging
import os
import sys
import re
from datetime import datetime
from pathlib import Path
from tqdm import tqdm

sys.path.append(str(Path('../').resolve()))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django

django.setup()
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


# -------------------------------------------------------------------------------------#


logging.basicConfig(level=logging.INFO)

class_year_enrollment_pattern = re.compile(r'Year (\d+): (\d+) students')


def parse_class_year_enrollments(enrollment_string, pattern):
    return pattern.findall(enrollment_string)


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

    # Process each department
    for code, name in unique_departments:
        Department.objects.update_or_create(code=code, defaults={'name': name})

    logging.info('Department insertions completed!')


# -------------------------------------------------------------------------------------#


def insert_academic_term(rows):
    logging.info('Starting AcademicTerm insertions...')

    def parse_date(date_str):
        return datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else None

    # Assuming the first row has the necessary data
    first_row = rows[0]

    term_code = str(first_row['Term Code'].strip())
    suffix = first_row['Term Name']
    start_date = parse_date(
        first_row.get('Course Start Date')
    )  # Ensure these are the correct column names
    end_date = parse_date(first_row.get('Course End Date'))

    # Use update_or_create to either update existing records or create a new one
    AcademicTerm.objects.update_or_create(
        term_code=term_code,
        defaults={'suffix': suffix, 'start_date': start_date, 'end_date': end_date},
    )

    logging.info('AcademicTerm insertion completed!')


# -------------------------------------------------------------------------------------#


def insert_course(rows):
    logging.info('Starting Course insertions...')

    departments = {dept.code: dept for dept in Department.objects.all()}
    new_courses = []
    updated_courses = []

    for row in tqdm(rows, desc='Processing Courses'):
        course_id = row['Course ID']
        dept_code = row['Subject Code']
        department = departments.get(dept_code)
        if not department:
            logging.warning(f'Department with code {dept_code} not found!')
            continue

        reading_list_entries = [
            f"{row[f'Reading List Title {i}']}:{row[f'Reading List Author {i}']}"
            for i in range(1, 7)
            if row.get(f'Reading List Author {i}')
            and row.get(f'Reading List Title {i}')
        ]
        reading_list = '; '.join(reading_list_entries)

        defaults = {
            'guid': row.get('Course GUID'),
            'department': department,
            'title': row['Course Title'],
            'catalog_number': row['Catalog Number'],
            'description': row.get('Course Description'),
            'drop_consent': row.get('Drop Consent'),
            'add_consent': row.get('Add Consent'),
            'web_address': row.get('Web Address'),
            'transcript_title': row.get('Transcript Title'),
            'long_title': row.get('Long Title'),
            'distribution_area_long': row.get('Distribution Area Long'),
            'distribution_area_short': row.get('Distribution Area Short'),
            'reading_writing_assignment': row.get('Reading Writing Assignment'),
            'grading_basis': row.get('Grading Basis'),
            'reading_list': reading_list,
        }

        try:
            course, created = Course.objects.get_or_create(
                course_id=course_id, defaults=defaults
            )
            if created:
                new_courses.append(course)
            else:
                updated_courses.append(course)

        except Course.MultipleObjectsReturned:
            logging.error(f'Duplicate courses found for Course ID: {course_id}')

    field_names = [field.name for field in Course._meta.fields if field.name != 'id']
    Course.objects.bulk_create(new_courses)
    Course.objects.bulk_update(updated_courses, field_names)

    logging.info('Course insertion completed!')


# -------------------------------------------------------------------------------------#


def insert_course_equivalent(rows):
    logging.info('Starting CourseEquivalent insertion...')
    course_cache = {course.guid: course for course in Course.objects.all()}
    new_course_equivalents = []
    updated_course_equivalents = []

    for row in tqdm(rows, desc='Processing Course Equivalents...'):
        primary_guid = row['Course GUID'].strip()
        primary_course = course_cache.get(primary_guid)

        if not primary_course:
            logging.warning(f'Primary course not found for Course GUID: {primary_guid}')
            continue

        if 'Crosslistings' not in row or pd.isna(row['Crosslistings']):
            continue  # Skip if no crosslistings

        crosslistings = set(
            crosslisting.strip()
            for crosslisting in str(row['Crosslistings']).split('/')
        )
        for crosslisting in crosslistings:
            crosslisting_parts = crosslisting.split()
            if len(crosslisting_parts) != 2:
                continue  # Skip if the format is not as expected

            crosslisting_dept, crosslisting_catalog = crosslisting_parts
            if (
                crosslisting_dept == row['Subject Code'].strip()
                and crosslisting_catalog == row['Catalog Number'].strip()
            ):
                continue  # Skip the primary course itself

            equivalent_course_key = (crosslisting_dept, crosslisting_catalog)
            if equivalent_course_key not in course_cache:
                try:
                    equivalent_course = Course.objects.get(
                        department__code=crosslisting_dept,
                        catalog_number=crosslisting_catalog,
                    )
                    course_cache[equivalent_course_key] = equivalent_course
                except Course.DoesNotExist:
                    logging.warning(
                        f'Equivalent course not found for Department: {crosslisting_dept}, Catalog Number: {crosslisting_catalog}'
                    )
                    continue

            course_equivalent, created = CourseEquivalent.objects.get_or_create(
                primary_course=primary_course,
                equivalent_course=course_cache[equivalent_course_key],
                defaults={'equivalence_type': 'CROSS_LIST'},
            )

            if not created:
                updated_course_equivalents.append(course_equivalent)

    field_names = [
        field.name for field in CourseEquivalent._meta.fields if field.name != 'id'
    ]
    CourseEquivalent.objects.bulk_create(new_course_equivalents, ignore_conflicts=True)
    CourseEquivalent.objects.bulk_update(updated_course_equivalents, field_names)

    logging.info('CourseEquivalent insertion completed!')


# -------------------------------------------------------------------------------------#


def insert_section(rows):
    logging.info('Starting Section processing...')

    for row in tqdm(rows, desc='Processing Sections...'):
        # Extract necessary data from the row
        guid = int(row['Course GUID'].strip())
        class_number = int(row['Class Number'].strip())
        term_code = row['Term Code'].strip()

        # Fetch the Course and AcademicTerm objects
        try:
            course_obj = Course.objects.get(guid=guid)
            term_obj = AcademicTerm.objects.get(term_code=term_code)
        except (Course.DoesNotExist, AcademicTerm.DoesNotExist) as e:
            logging.error(f'Required Course or AcademicTerm not found: {e}')
            continue  # Skip this row if either object is not found

        # Fetch or create the instructor
        instructor_emplid = row.get('Instructor EmplID', '').strip()
        instructor_first_name = row.get('Instructor First Name', '').strip()
        instructor_last_name = row.get('Instructor Last Name', '').strip()
        instructor_full_name = f'{instructor_first_name} {instructor_last_name}'.strip()

        instructor_obj = None
        if instructor_emplid:
            try:
                instructor_obj, _ = Instructor.objects.get_or_create(
                    emplid=instructor_emplid,
                    defaults={
                        'first_name': instructor_first_name,
                        'last_name': instructor_last_name,
                        'full_name': instructor_full_name,
                    },
                )
            except Exception as e:
                logging.error(f'Error creating/updating Instructor: {e}')
                continue  # Skip this row if there's an error with instructor creation

        # Update or create the section
        try:
            section_obj, created = Section.objects.update_or_create(
                class_number=class_number,
                defaults={
                    'course': course_obj,
                    'class_type': row.get('Class Type', ''),
                    'class_section': row.get('Class Section', ''),
                    'term': term_obj,
                    'track': row.get('Course Track', '').strip(),
                    'seat_reservations': row.get('Has Seat Reservations', '').strip(),
                    'capacity': int(row.get('Class Capacity', 0)),
                    'status': row.get('Class Status', ''),
                    'enrollment': int(row.get('Class Enrollment', 0)),
                    'instructor': instructor_obj if instructor_obj else None,
                },
            )
        except Exception as e:
            logging.error(f'Error creating/updating Section: {e}')

    logging.info('Section processing completed!')


# -------------------------------------------------------------------------------------#


def insert_class_year_enrollment(rows):
    logging.info('Starting ClassYearEnrollment insertions and updates...')

    for row in tqdm(rows, desc='Processing Class Year Enrollments...'):
        course_id = int(row['Course ID'].strip())
        guid = int(row['Course GUID'].strip())
        term_code = row['Term Code'].strip()
        class_number = row['Class Number'].strip()
        class_section = row['Class Section'].strip()

        try:
            section = Section.objects.get(
                course__course_id=course_id,
                course__guid=guid,
                term__term_code=term_code,
                class_number=class_number,
            )
        except Section.DoesNotExist:
            logging.error(  # Changed to error for consistency
                f'Section not found for Course ID: {course_id}, Term Code: {term_code}, Class Section: {class_section}'
            )
            continue
        enrollment_info = parse_class_year_enrollments(
            row['Class Year Enrollments'], class_year_enrollment_pattern
        )

    for class_year, enrl_seats in enrollment_info:
        ClassYearEnrollment.objects.update_or_create(
            section=section,
            class_year=int(class_year),
            defaults={'enrl_seats': int(enrl_seats)},
        )

    logging.info('ClassYearEnrollment insertions and updates completed!')


# -------------------------------------------------------------------------------------#


def insert_class_meeting(rows):
    logging.info('Starting ClassMeeting insertions and updates...')

    def parse_time(time_str):
        return datetime.strptime(time_str, '%H:%M').time()

    for row in tqdm(rows, desc='Processing Class Meetings...'):
        course_id = int(row['Course ID'].strip())
        term_code = int(row['Term Code'].strip())
        class_section = row['Class Section']
        meeting_number = int(row['Meeting Number'].strip())

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

        defaults = {
            'start_time': parse_time(row['Meeting Start Time']),
            'end_time': parse_time(row['Meeting End Time']),
            'room': row.get('Meeting Room', '').strip(),
            'days': row.get('Meeting Days', '').strip(),
            'building_name': row.get('Building Name', '').strip(),
        }

        ClassMeeting.objects.update_or_create(
            section=section, meeting_number=meeting_number, defaults=defaults
        )

    logging.info('ClassMeeting insertions and updates completed!')


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
            # insert_department(trimmed_rows)
            # insert_academic_term(trimmed_rows)
            # insert_course(trimmed_rows)
            insert_course_equivalent(trimmed_rows)
            # insert_section(trimmed_rows)
            # insert_class_meeting(trimmed_rows)
            # insert_class_year_enrollment(trimmed_rows)

    except Exception as e:
        logging.error(f'Transaction failed: {e}')
