from django.db.models import Q, F, Value, When, Case
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.conf import settings
from django.views import View
from django.core.exceptions import ObjectDoesNotExist
from .models import models, Course
from .serializers import CourseSerializer
import json
import logging
import re

logger = logging.getLogger(__name__)

#-------------------------------------- LOG IN --------------------------------------------#

def login(request):
    """
    Redirects to the CAS login page.
    """
    logger.info(f"Received login request from {request.META.get('REMOTE_ADDR')}")
    try:
        logger.info(f"Redirecting to {settings.CAS_URL}")
        return HttpResponseRedirect(settings.CAS_URL)
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        return HttpResponse(status=500)

def is_authenticated(request):
    """
    Checks if the user is authenticated.
    """
    logger.info(f"Received is_authenticated request from {request.META.get('REMOTE_ADDR')}")
    authenticated = 'username' in request.session
    status = "authenticated" if authenticated else "not authenticated"
    logger.info(f"User is {status}.")
    if authenticated:
        response_data = {'authenticated': True, 'username': request.session['username']}
    else:
        response_data = {'authenticated': False, 'username': None}
        
    return JsonResponse(response_data)

#------------------------------- SEARCH COURSES --------------------------------------#

class SearchCourses(View):
    """
    Handles search queries for courses.
    """
    def get(self, request, *args, **kwargs):
        query = request.GET.get('course', None)
        if re.match(r"^[a-zA-Z]{3}\d{3}$", query):
            query = re.split(r'\d', query, 1)
        if query:
            if len(query) == 2:
                dept = query[0]
                num = query[1]
                title = ''
            else:
                dept = query
                num = query
                title = query
            try:
                courses = Course.objects.filter(
                    Q(catalog_number__icontains=num) |
                    Q(department__code__icontains=dept) |
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

                sorted_courses = courses.annotate(custom_sorting=custom_sorting_field).order_by('-custom_sorting', 'department__code', 'catalog_number', 'title')

                serialized_courses = CourseSerializer(sorted_courses, many=True)
                # serialized_data = [{"subjectCode": c.subjectCode, "catalogNumber": c.catalogNumber, "title": c.title} for c in courses]
                
                # Print for debugging
                # logger.info(serialized_courses.data)
                return JsonResponse({"courses": serialized_courses.data})
            
            except Exception as e:
                logger.error(f"An error occurred while searching for courses: {e}")
                return JsonResponse({"error": "Internal Server Error"}, status=500)
        else:
            return JsonResponse({"courses": []})
