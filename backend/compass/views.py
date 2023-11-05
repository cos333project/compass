from django.db.models import Q, F, Value, When, Case
from django.http import HttpResponseServerError, HttpResponseRedirect, JsonResponse
from django.conf import settings
from django.views import View
from django.core.exceptions import ObjectDoesNotExist
from .models import models, Course
from .serializers import CourseSerializer
import json
import logging
import re

logger = logging.getLogger(__name__)

#------------------------------------ LOG IN -----------------------------------------#

def authenticate(request):
    authenticated = request.user.is_authenticated
    status = "authenticated" if authenticated else "not authenticated"
    logger.info(f"Incoming GET request: {request.GET}, Session: {request.session}")
    logger.info(f"Request Headers: {request.headers}")
    logger.info(f"User is {status}. Cookies: {request.COOKIES}")
    return JsonResponse({'authenticated': authenticated})

#------------------------------- SEARCH COURSES --------------------------------------#

DEPT_NUM_SUFFIX_REGEX = re.compile(r"^[a-zA-Z]{1,3}\d{1,3}[a-zA-Z]{1}$", re.IGNORECASE)
DEPT_NUM_REGEX = re.compile(r"^[a-zA-Z]{1,3}\d{1,3}$", re.IGNORECASE)
NUM_DEPT_REGEX = re.compile(r"^\d{1,3}[a-zA-Z]{1,3}$", re.IGNORECASE)
DEPT_ONLY_REGEX = re.compile(r"^[a-zA-Z]{1,3}$", re.IGNORECASE)
NUM_ONLY_REGEX = re.compile(r"^\d{1,3}$", re.IGNORECASE)

class SearchCourses(View):
    """
    Handles search queries for courses.
    """
    def get(self, request, *args, **kwargs):
        query = request.GET.get('course', None)
        if query:
            if query == '*' or query == '.':
                courses = Course.objects.select_related('department').all()
                serialized_courses = CourseSerializer(courses, many=True)
                return JsonResponse({"courses": serialized_courses.data})

            # process queries
            trimmed_query = re.sub(r'\s', '', query)
            title = 'nevergoingtomatch'
            if DEPT_NUM_SUFFIX_REGEX.match(trimmed_query):
                result = re.split(r'(\d+[a-zA-Z])', trimmed_query, 1)
                dept = result[0]
                num = result[1]
            elif DEPT_NUM_REGEX.match(trimmed_query):
                result = re.split(r'(\d+)', trimmed_query, 1)
                dept = result[0]
                num = result[1]
            elif NUM_DEPT_REGEX.match(trimmed_query):
                result = re.split(r'([a-zA-Z]+)', trimmed_query, 1)
                dept = result[1]
                num = result[0]
            elif DEPT_ONLY_REGEX.match(trimmed_query):
                dept = trimmed_query
                num = 'nevergoingtomatch'
                title = query.strip()
            elif NUM_ONLY_REGEX.match(trimmed_query):
                dept = 'nevergoingtomatch'
                num = trimmed_query
            else:
                dept = 'nevergoingtomatch'
                num = 'nevergoingtomatch'
                title = query.strip()

            try:
                exact_match_course = Course.objects.select_related('department').filter(
                    Q(department__code__iexact=dept) & Q(catalog_number__iexact=num)
                )
                if exact_match_course:
                    # If an exact match is found, return only that course
                    serialized_course = CourseSerializer(exact_match_course, many=True)
                    return JsonResponse({"courses": serialized_course.data})
                courses = Course.objects.filter(
                    Q(department__code__icontains=dept) |
                    Q(catalog_number__icontains=num) |
                    Q(title__icontains=title) |
                    Q(distribution_area_short__icontains='') |
                    Q(distribution_area_long__icontains='')
                )
                if not courses.exists():
                    return JsonResponse({"courses": []})

                custom_sorting_field = Case(
                    When(Q(department__code__icontains=dept) & Q(catalog_number__icontains=num), then=Value(3)),
                    When(Q(department__code__icontains=dept), then=Value(2)),
                    When(Q(catalog_number__icontains=num), then=Value(1)),
                    default=Value(0),
                    output_field=models.IntegerField()
                )
                sorted_courses = courses.annotate(custom_sorting=custom_sorting_field).order_by(
                    '-custom_sorting', 'department__code', 'catalog_number', 'title')
                serialized_courses = CourseSerializer(sorted_courses, many=True)
                return JsonResponse({"courses": serialized_courses.data})

            except Exception as e:
                logger.error(f"An error occurred while searching for courses: {e}")
                return JsonResponse({"error": "Internal Server Error"}, status=500)
        else:
            return JsonResponse({"courses": []})
