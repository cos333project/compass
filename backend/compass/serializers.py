
from rest_framework import serializers
from .models import Course, Department

class CourseSerializer(serializers.ModelSerializer):
    code = serializers.CharField(source='department.code', read_only=True)

    class Meta:
        model = Course
        fields = ['code', 'catalog_number', 'title']
