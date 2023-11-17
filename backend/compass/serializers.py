from rest_framework import serializers
from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    department_code = serializers.CharField(source='department.code', read_only=True)

    class Meta:
        model = Course
        fields = [
            'course_id',
            'department_code',
            'catalog_number',
            'title',
            'distribution_area_short',
        ]
