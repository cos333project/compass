import os
import sys
import django
import django.utils.timezone

# Assuming /Users/minhtri/Desktop/Princeton/COS/COS 333/compass/backend is the Django project root
# which contains the manage.py file
project_root = '/Users/minhtri/Desktop/Princeton/COS/COS 333/compass/backend'
sys.path.append(project_root)

# Now set the default settings
# Make sure 'config' is the name of your Django project (the folder that contains settings.py)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Set up Django
django.setup()

# After setting up Django, you should be able to import your models and serializers
from compass.models import Course
from compass.serializers import CourseSerializer


def fetch_and_serialize_courses():
    # Start the timer
    start_time = django.utils.timezone.now()

    # Fetch all courses
    courses = Course.objects.select_related('department').all()
    # courses = Course.objects.filter()
    # Serialize the courses
    serialized_courses = CourseSerializer(courses, many=True).data

    # Measure the total time taken
    elapsed_time = django.utils.timezone.now() - start_time
    
    # Printing for debugging
    print(f"Serialized Data: {serialized_courses[:10]}")
    print(f"Time Taken: {elapsed_time.total_seconds()} seconds")
    
    # Return the serialized data and the time taken
    # The JsonResponse should be used in a Django view, but since this is a script, we'll just print the output
    response_data = {
        'courses': serialized_courses[:1],
        'time_taken': elapsed_time.total_seconds()
    }
    return response_data

# Call the function and print the result
if __name__ == "__main__":
    print("Fetching and serializing courses...")
    fetch_and_serialize_courses()
