# DELETE ONCE INSERT_DATA.PY IS FINISHED

import sys
import csv
import logging
from pathlib import Path
from django.db import transaction

logging.basicConfig(level=logging.INFO)
sys.path.append(str(Path("..").resolve()))
from config import django_init
from compass.models import Course, Department

relative_path = Path("../data/f2023_courses.csv")
abs_path = relative_path.resolve()

def clean_string(s):
    return s.strip()

def process_department_rows(rows):
    logging.info("Starting Department insertion...")
    departments = {(clean_string(row['Subject Code']), clean_string(row['Subject Name'])) for row in rows}
    new_departments = [
        Department(code=code, name=name)
        for code, name in departments
        if not Department.objects.filter(code=code).exists()
    ]
    Department.objects.bulk_create(new_departments)
    logging.info("Department insertion completed!")

def process_course_rows(rows):
    logging.info("Starting Course insertion...")
    new_courses = []
    for row in rows:
        clean_row = {clean_string(key): clean_string(value) for key, value in row.items()}
        department, _ = Department.objects.get_or_create(code=clean_row['Subject Code'])
        defaults = {'catalog_number': clean_row['Catalog Number'], 'title': clean_row['Course Title'], 'department': department}
        new_courses.append(Course(course_id=clean_row['Course ID'], **defaults))
    Course.objects.bulk_create(new_courses)
    logging.info("Course insertion completed!")

if __name__ == "__main__":
    # Read CSV into list of rows
    with abs_path.open('r') as file:
        reader = csv.DictReader(file)
        rows = [row for row in reader]
    
    # Trim the column names
    trimmed_rows = [
        {key.strip(): value.strip() for key, value in row.items()}
        for row in rows
    ]
    
    try:
        with transaction.atomic():
            process_department_rows(trimmed_rows)
        with transaction.atomic():
            process_course_rows(trimmed_rows)
    except Exception as e:
        logging.error(f"Transaction failed: {e}")
