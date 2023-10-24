from compass.models import Minor, MinorRequirement, Category, Course
import yaml
from pathlib import Path    

def populate_db_from_yaml(yaml):
    """
    Populates the database using Django's ORM based on the given YAML data.
    """
    for minor in yaml.get('Minors', []):
        minor_data = minor.get('Minor', {})

        minor_obj, _ = Minor.objects.get_or_create(
            code=minor_data.get('code'),
            defaults={
                'name': minor_data.get('name'),
                'application_deadline': minor_data.get('application_deadline'),
                'max_courses_from_major': minor_data.get('max_courses_from_major'),
                'max_courses_from_other': minor_data.get('max_courses_from_other')
            }
        )

        for req in minor.get('MinorRequirements', []):
            category_obj, _ = Category.objects.get_or_create(name=req.get('RequirementType'))
            
            # Associate courses with this Category
            course_codes = [course.get('course_code') for course in req.get('Courses', [])]
            courses = Course.objects.filter(code__in=course_codes)
            category_obj.courses.set(courses)

            MinorRequirement.objects.get_or_create(
                minor=minor_obj,
                description=req.get('description'),
                defaults={
                    'declare_by': req.get('declare_by'),
                    'min_required': req.get('min_required'),
                    'category': category_obj
                }
            )

# Parsing the YAML data
relative_path = Path("../data/mqe-simple.yaml")
abs_path = relative_path.resolve()

with abs_path.open('r') as file:
    parsed_yaml = yaml.safe_load(file)

# Populate the database
populate_db_from_yaml(parsed_yaml)
