import argparse
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

CLASS_YEAR_ENROLLMENT_PATTERN = re.compile(r'Year (\d+): (\d+) students')


def _parse_class_year_enrollments(str, pattern):
    if str == 'Class year demographics unavailable':
        return []
    return pattern.findall(str)


def _parse_time(time_str):
    try:
        return datetime.strptime(time_str, '%I:%M %p').strftime('%H:%M')
    except ValueError:
        return None


# -------------------------------------------------------------------------------------#


def insert_departments(rows):
    logging.info('Starting Department insertions and updates...')

    unique_departments = {(row['Subject Code'], row['Subject Name']) for row in rows}
    existing_departments = Department.objects.filter(
        code__in=[code for code, _ in unique_departments]
    )
    existing_codes = {department.code for department in existing_departments}

    departments_to_create = []
    departments_to_update = []

    for code, name in unique_departments:
        if code in existing_codes:
            # Update the existing department
            department = existing_departments.get(code=code)
            department.name = name
            departments_to_update.append(department)
        else:
            # Create a new department
            departments_to_create.append(Department(code=code, name=name))

    Department.objects.bulk_create(departments_to_create)
    Department.objects.bulk_update(departments_to_update, ['name'])

    logging.info('Department insertions and updates completed!')


# -------------------------------------------------------------------------------------#


def insert_academic_terms(rows):
    logging.info('Starting AcademicTerm insertions and updates...')

    def parse_date(date_str):
        return datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else None

    # Assuming the first row has the necessary data
    first_row = rows[0]

    term_code = first_row['Term Code'].strip()
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

    logging.info('AcademicTerm insertions completed!')


# -------------------------------------------------------------------------------------#


def insert_courses(rows):
    logging.info('Starting Course insertions and updates...')

    departments = {dept.code: dept for dept in Department.objects.all()}
    existing_courses = {course.guid: course for course in Course.objects.all()}
    new_courses = []
    updated_courses = []

    for row in tqdm(rows, desc='Processing Courses'):
        guid = row.get('Course GUID')
        if guid in existing_courses:
            continue  # Skip if no GUID or if GUID already processed

        dept_code = row['Subject Code']
        department = departments.get(dept_code)
        if not department:
            logging.warning(f'Department with code {dept_code} not found!')
            continue

        reading_list_entries = [
            f"{row[f'Reading List Title {i}']}//{row[f'Reading List Author {i}']}"
            for i in range(1, 7)
            if row.get(f'Reading List Author {i}')
            and row.get(f'Reading List Title {i}')
        ]
        reading_list = ';'.join(reading_list_entries)

        defaults = {
            'course_id': row['Course ID'],
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

        course = existing_courses.get(guid)
        if course:
            # Update existing course
            for key, value in defaults.items():
                setattr(course, key, value)
            updated_courses.append(course)
        else:
            # Create new course instance
            new_course = Course(guid=guid, **defaults)
            new_courses.append(new_course)
            existing_courses[guid] = new_course

    # Define the fields to update using list comprehension
    update_fields = [field.name for field in Course._meta.fields if field.name != 'id']

    # Bulk create new courses
    Course.objects.bulk_create(new_courses)
    # Bulk update existing courses
    Course.objects.bulk_update(updated_courses, update_fields)

    logging.info('Course insertions and updates completed!')


# -------------------------------------------------------------------------------------#


def insert_course_equivalents(rows):
    logging.info('Starting CourseEquivalent insertions and updates...')

    departments = {dept.code: dept for dept in Department.objects.all()}
    course_cache = {course.guid: course for course in Course.objects.all()}
    existing_course_equivalents = {
        (ce.primary_course.guid, ce.equivalent_course.guid): ce
        for ce in CourseEquivalent.objects.select_related(
            'primary_course', 'equivalent_course'
        )
    }
    processed_guids = set()
    new_courses = []
    new_course_equivalents = []
    updated_course_equivalents = []

    for row in tqdm(rows, desc='Processing Course Equivalents...'):
        primary_guid = row['Course GUID'].strip()
        if primary_guid in processed_guids or not row['Crosslistings']:
            continue
        processed_guids.add(primary_guid)

        primary_course = course_cache.get(primary_guid)
        if not primary_course:
            continue

        crosslistings = row['Crosslistings'].split(' / ')
        for crosslisting in crosslistings[1:]:
            parts = crosslisting.split()
            if len(parts) == 2:
                department_code, catalog_number = parts
            else:
                # Attempt to separate the department code and catalog number
                department_code = ''.join(filter(str.isalpha, crosslisting))
                catalog_number = ''.join(filter(str.isdigit, crosslisting))
                if not department_code or not catalog_number:
                    logging.warning(f'Could not parse crosslisting: {crosslisting}')
                    continue

            cross_department = departments.get(department_code)
            if not cross_department:
                logging.warning(f'Department not found for code: {department_code}')
                continue

            # Check if equivalent course exists
            cross_course = course_cache.get((department_code, catalog_number))
            if not cross_course:
                cross_course = Course(
                    guid=primary_guid,  # Same GUID as primary course
                    course_id=primary_course.course_id,
                    department=cross_department,
                    title=primary_course.title,
                    catalog_number=catalog_number,
                    description=primary_course.description,
                    drop_consent=primary_course.drop_consent,
                    add_consent=primary_course.add_consent,
                    web_address=primary_course.web_address,
                    transcript_title=primary_course.transcript_title,
                    long_title=primary_course.long_title,
                    distribution_area_long=primary_course.distribution_area_long,
                    distribution_area_short=primary_course.distribution_area_short,
                    reading_writing_assignment=primary_course.reading_writing_assignment,
                    grading_basis=primary_course.grading_basis,
                    reading_list=primary_course.reading_list,
                )
                new_courses.append(cross_course)
                course_cache[(department_code, catalog_number)] = cross_course

            course_equivalent_key = (primary_course.guid, cross_course.guid)
            if course_equivalent_key in existing_course_equivalents:
                # Update existing CourseEquivalent
                course_equivalent = existing_course_equivalents[course_equivalent_key]
                course_equivalent.equivalence_type = 'CROSS_LIST'
                updated_course_equivalents.append(course_equivalent)
            else:
                # Create new CourseEquivalent
                course_equivalent = CourseEquivalent(
                    primary_course=primary_course,
                    equivalent_course=cross_course,
                    equivalence_type='CROSS_LIST',
                )
                new_course_equivalents.append(course_equivalent)

    # Perform bulk creation and updating
    Course.objects.bulk_create(new_courses)
    CourseEquivalent.objects.bulk_create(new_course_equivalents, ignore_conflicts=True)
    CourseEquivalent.objects.bulk_update(
        updated_course_equivalents, ['equivalence_type']
    )

    logging.info('CourseEquivalent insertion and update completed!')


# -------------------------------------------------------------------------------------#


def insert_instructors(rows):
    existing_instructors = {
        instructor.emplid: instructor for instructor in Instructor.objects.all()
    }
    new_instructors = []
    updated_instructors = []

    for row in tqdm(rows, desc='Processing Instructors'):
        instructor_emplid = row.get('Instructor EmplID', '').strip()
        if not instructor_emplid:
            continue

        first_name = row.get('Instructor First Name', '').strip()
        last_name = row.get('Instructor Last Name', '').strip()
        full_name = row.get('Instructor Full Name', f'{first_name} {last_name}'.strip())

        instructor = existing_instructors.get(instructor_emplid)
        if instructor:
            # Update existing instructor
            instructor.first_name = first_name
            instructor.last_name = last_name
            instructor.full_name = full_name
            updated_instructors.append(instructor)
        else:
            # Create new instructor
            new_instructor = Instructor(
                emplid=instructor_emplid,
                first_name=first_name,
                last_name=last_name,
                full_name=full_name,
            )
            new_instructors.append(new_instructor)
            existing_instructors[instructor_emplid] = new_instructor

    Instructor.objects.bulk_create(new_instructors)
    update_fields = ['first_name', 'last_name', 'full_name']
    Instructor.objects.bulk_update(updated_instructors, update_fields)

    return existing_instructors


# -------------------------------------------------------------------------------------#


def insert_sections(rows):
    logging.info('Starting Section insertions and updates...')

    term_cache = {term.term_code: term for term in AcademicTerm.objects.all()}
    course_cache = {course.guid: course for course in Course.objects.all()}
    instructor_cache = insert_instructors(rows)
    existing_sections = {
        section.class_number: section for section in Section.objects.all()
    }
    new_sections = []
    updated_sections = []
    processed_class_numbers = set()

    for row in tqdm(rows, desc='Processing Sections...'):
        try:
            class_number = int(row['Class Number'].strip())
        except ValueError:
            logging.error(f"Invalid class number: {row['Class Number']}")
            continue
        # Skip if class number already processed
        if class_number in processed_class_numbers:
            continue
        term = term_cache.get(row['Term Code'].strip())
        course = course_cache.get(row['Course GUID'].strip())
        instructor_emplid = row.get('Instructor EmplID', '').strip()
        instructor = instructor_cache.get(instructor_emplid)

        if not term or not course or not instructor:
            logging.error('Required data not found for row')
            continue

        section_data = {
            'class_number': class_number,
            'class_type': row.get('Class Type', ''),
            'class_section': row.get('Class Section', ''),
            'track': row.get('Course Track', '').strip(),
            'seat_reservations': row.get('Has Seat Reservations', '').strip(),
            'capacity': int(row.get('Class Capacity', 0)),
            'status': row.get('Class Status', ''),
            'enrollment': int(row.get('Class Enrollment', 0)),
            'course_id': course.id,
            'instructor': instructor,
            'term_id': term.id,
        }

        section = existing_sections.get(class_number)
        if section:
            for key, value in section_data.items():
                setattr(section, key, value)
            updated_sections.append(section)
        else:
            new_section = Section(**section_data)
            new_sections.append(new_section)
            processed_class_numbers.add(class_number)

    update_fields = [field.name for field in Section._meta.fields if field.name != 'id']

    try:
        Section.objects.bulk_create(new_sections)
        Section.objects.bulk_update(updated_sections, update_fields)
    except Exception as e:
        logging.error(f'Error in bulk operation: {e}')

    logging.info('Section processing completed!')


# -------------------------------------------------------------------------------------#


def insert_class_meetings(rows):
    logging.info('Starting ClassMeeting insertions and updates...')
    section_cache = {
        (section.course.course_id, section.term.id, section.class_section): section
        for section in Section.objects.select_related('course', 'term')
    }

    term_id_map = {term.term_code: term.id for term in AcademicTerm.objects.all()}

    # Collect relevant section IDs
    relevant_section_ids = set()
    for row in tqdm(rows, desc='Checking for updates in Class Meetings...'):
        course_id = row['Course ID'].strip()
        term_code = row['Term Code'].strip()
        class_section = row['Class Section'].strip()
        term_id = term_id_map.get(term_code)
        section_key = (course_id, term_id, class_section)
        section = section_cache.get(section_key)
        if section:
            relevant_section_ids.add(section.id)

    # Fetch only relevant ClassMeeting objects
    existing_meetings = {
        (meeting.section.id, meeting.meeting_number): meeting
        for meeting in ClassMeeting.objects.filter(section_id__in=relevant_section_ids)
    }

    new_meetings = []
    updated_meetings = []

    for row in tqdm(rows, desc='Processing Class Meetings'):
        course_id = row['Course ID'].strip()
        term_code = row['Term Code'].strip()
        class_section = row['Class Section'].strip()
        meeting_number = int(row['Meeting Number'].strip())

        term_id = term_id_map.get(term_code)
        if term_id is None:
            logging.warning(f'Term code {term_code} not found in AcademicTerm table')
            continue
        section_key = (course_id, term_id, class_section)

        section = section_cache.get(section_key)
        if not section:
            logging.warning(
                f'Section not found for Course ID: {course_id}, Term Code: {term_code}, Class Section: {class_section}'
            )
            continue

        start_time = _parse_time(row.get('Meeting Start Time', ''))
        end_time = _parse_time(row.get('Meeting End Time', ''))

        if not start_time or not end_time:
            logging.error('Invalid meeting time format')
            continue

        meeting_key = (section.id, meeting_number)
        if meeting_key in existing_meetings:
            # Update existing class meeting
            meeting = existing_meetings[meeting_key]
            meeting.start_time = _parse_time(row['Meeting Start Time'])
            meeting.end_time = _parse_time(row['Meeting End Time'])
            meeting.room = row.get('Meeting Room', '').strip()
            meeting.days = row.get('Meeting Days', '').strip()
            meeting.building_name = row.get('Building Name', '').strip()
            updated_meetings.append(meeting)
        else:
            # Create new class meeting
            new_meeting = ClassMeeting(
                section=section,
                meeting_number=meeting_number,
                start_time=_parse_time(row['Meeting Start Time']),
                end_time=_parse_time(row['Meeting End Time']),
                room=row.get('Meeting Room', '').strip(),
                days=row.get('Meeting Days', '').strip(),
                building_name=row.get('Building Name', '').strip(),
            )
            new_meetings.append(new_meeting)

    update_fields = ['start_time', 'end_time', 'room', 'days', 'building_name']

    try:
        ClassMeeting.objects.bulk_create(new_meetings)
        ClassMeeting.objects.bulk_update(updated_meetings, update_fields)
    except Exception as e:
        logging.error(f'Error in bulk operation: {e}')

    logging.info('ClassMeeting insertions and updates completed!')


# -------------------------------------------------------------------------------------#


def insert_class_year_enrollments(rows):
    logging.info('Starting ClassYearEnrollment insertions and updates...')

    # Cache for Section objects to reduce database queries
    # Assuming class_number is unique across semesters
    section_cache = {section.class_number: section for section in Section.objects.all()}

    # Collect relevant section IDs
    relevant_section_ids = set()
    for row in tqdm(rows, desc='Checking for updates in Class Year Enrollments...'):
        class_number = int(row['Class Number'].strip())
        if class_number in section_cache:
            relevant_section_ids.add(section_cache[class_number].id)

    # Fetch only relevant ClassYearEnrollment objects
    existing_enrollments = {
        (enrollment.section.id, enrollment.class_year): enrollment
        for enrollment in ClassYearEnrollment.objects.filter(
            section_id__in=relevant_section_ids
        )
    }

    new_enrollments = []
    updated_enrollments = []

    for row in tqdm(rows, desc='Processing Class Year Enrollments...'):
        class_number = int(row['Class Number'].strip())

        section = section_cache.get(class_number)
        if not section:
            logging.error(f'Section not found for Class Number: {class_number}')
            continue

        enrollment_info = _parse_class_year_enrollments(
            row['Class Year Enrollments'], CLASS_YEAR_ENROLLMENT_PATTERN
        )

        if not enrollment_info:  # No restrictions
            key = (section.id, None)
            if key not in existing_enrollments:
                new_enrollment = ClassYearEnrollment(section=section)
                new_enrollments.append(new_enrollment)
            continue

        for class_year, enrl_seats in enrollment_info:
            key = (section.id, int(class_year))
            if key in existing_enrollments:
                # Update existing enrollment
                enrollment = existing_enrollments[key]
                enrollment.enrl_seats = int(enrl_seats)
                updated_enrollments.append(enrollment)
            else:
                # Create new enrollment
                new_enrollment = ClassYearEnrollment(
                    section=section,
                    class_year=int(class_year),
                    enrl_seats=int(enrl_seats),
                )
                new_enrollments.append(new_enrollment)

    # Bulk operations for efficiency
    update_fields = ['enrl_seats']
    try:
        ClassYearEnrollment.objects.bulk_create(new_enrollments)
        ClassYearEnrollment.objects.bulk_update(updated_enrollments, update_fields)
    except Exception as e:
        logging.error(f'Error in bulk operation: {e}')

    logging.info('ClassYearEnrollment insertions and updates completed!')


# -------------------------------------------------------------------------------------#


def get_semesters_from_args():
    parser = argparse.ArgumentParser(
        description='Fetch academic course data for specified semesters.'
    )
    parser.add_argument(
        'semesters',
        nargs='*',
        help='Semesters to generate CSVs for, e.g., f2019 s2022.',
    )
    args = parser.parse_args()

    if not args.semesters:
        print(
            'No semesters provided as arguments. Please enter the semesters separated by spaces:'
        )
        args.semesters = input().strip().split(' ')

    return args.semesters


# -------------------------------------------------------------------------------------#


def insert_course_data(semester):
    data = Path(f'{semester}.csv')

    if not data.exists():
        print(f'The file {data} does not exist in the data directory. Skipping.')
        return

    with data.open('r') as file:
        reader = csv.DictReader(file)
        rows = [row for row in reader]

    trimmed_rows = [
        {key.strip(): value.strip() for key, value in row.items()} for row in rows
    ]

    try:
        with transaction.atomic():
            # insert_departments(trimmed_rows)
            insert_academic_terms(trimmed_rows)
            insert_courses(trimmed_rows)
            # insert_course_equivalents(trimmed_rows)
            # insert_sections(trimmed_rows)
            # insert_class_meetings(trimmed_rows)
            # insert_class_year_enrollments(trimmed_rows)

    except Exception as e:
        logging.error(f'Transaction failed: {e}')


# -------------------------------------------------------------------------------------#


def main():
    start_time = datetime.now()
    semesters = get_semesters_from_args()
    for semester in semesters:
        insert_course_data(semester)
    end_time = datetime.now()
    print(f'Finished in {end_time - start_time} seconds.')


# -------------------------------------------------------------------------------------#


if __name__ == '__main__':
    main()
