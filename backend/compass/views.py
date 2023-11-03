from django.db.models import Q
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.conf import settings
from django.views import View
from django.core.exceptions import ObjectDoesNotExist
from .models import Course
from .serializers import CourseSerializer
import json
import logging

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
        if query:
            try:
                # courses = Course.objects.filter(title__icontains=query)
                courses = Course.objects.filter(
                    Q(catalog_number__icontains=query) |
                    Q(title__icontains=query) | 
                    Q(department__code__icontains=query)
                ).order_by('catalog_number', 'title', 'department__code')
                if not courses.exists():
                    return JsonResponse({"courses": []})
                serialized_courses = CourseSerializer(courses, many=True)
                # serialized_data = [{"subjectCode": c.subjectCode, "catalogNumber": c.catalogNumber, "title": c.title} for c in courses]
                
                # Print for debugging
                # logger.info(serialized_courses.data)
                return JsonResponse({"courses": serialized_courses.data})
            
            except Exception as e:
                logger.error(f"An error occurred while searching for courses: {e}")
                return JsonResponse({"error": "Internal Server Error"}, status=500)
        else:
            return JsonResponse({"courses": []})
