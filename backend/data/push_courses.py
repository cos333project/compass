import sys
import csv
import logging
from pathlib import Path
sys.path.append('/Users/minhtri/Desktop/Princeton/COS/COS 333/compass/backend') # make this your own path
from config import django_init
from compass.models import Course, Department, AcademicTerm
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction

logging.basicConfig(level=logging.INFO)

# Path to CSV file
relative_path = Path("../data/f2023_courses.csv")  # Update this path as needed
abs_path = relative_path.resolve()

# Function to clean up column names and values
def clean_string(s):
    return s.strip()


# Insert Departments
logging.info("Starting Department insertion.")
departments = set()
with abs_path.open('r') as file:
    reader = csv.DictReader(file)
    for row in reader:
        clean_row = {clean_string(key): clean_string(value) for key, value in row.items()}
        departments.add((clean_row['Subject Code'], clean_row['Subject Name']))

with transaction.atomic():
    for code, name in departments:
        department, created = Department.objects.get_or_create(code=code)
        if created:
            department.name = name
            department.save()
            logging.info(f"Created new Department with code: {code}")
        else:
            logging.info(f"Department with code {code} already exists.")
            if department.name != name:
                department.name = name
                department.save()
                logging.info(f"Updated name for Department with code {code}")
                
logging.info("Starting Course insertion.")
with transaction.atomic(), abs_path.open('r') as file:
    reader = csv.DictReader(file)
    for row in reader:
        clean_row = {clean_string(key): clean_string(value) for key, value in row.items()}
        department, _ = Department.objects.get_or_create(code=clean_row['Subject Code'])
        course, created = Course.objects.get_or_create(course_id=clean_row['Course ID'],
                                                       defaults={'catalog_number': clean_row['Catalog Number'],
                                                                 'title': clean_row['Course Title'],
                                                                 'department': department})
        if created:
            logging.info(f"Created new Course with ID: {clean_row['Course ID']}")
        else:
            logging.info(f"Updating existing Course with ID: {clean_row['Course ID']}")
            course.catalog_number = clean_row['Catalog Number']
            course.title = clean_row['Course Title']
            course.department = department
            course.save()
            