from django.db.models import Q
from django.http import HttpResponseRedirect, JsonResponse, HttpResponseServerError
from django.conf import settings
from django.views import View
from django.views.decorators.http import require_GET
from django.core.exceptions import ObjectDoesNotExist
from .models import Course
from .serializers import CourseSerializer
import json
from urllib.parse import quote
import traceback
import logging
from utils.cas_client import CASClient

logger = logging.getLogger(__name__)

#-------------------------------------- LOG IN --------------------------------------------#

cas = CASClient(get_response=None)

def login(request):
    try:
        logger.info(f"Incoming GET request: {request.GET}, Session: {request.session}")
        logger.info(f"Received login request from {request.META.get('REMOTE_ADDR')}")

        response = cas.authenticate(request)
        if response is not None:
            return response  # Redirect to CAS login
        else:
            dashboard = f"{settings.HOMEPAGE}/dashboard"
            return HttpResponseRedirect(dashboard)  # Or redirect to dashboard, etc.
    except Exception as e:
        logger.error(f"Exception in login view: {e}")
        return HttpResponseServerError()
    
def logout(request):
    logger.info(f"Incoming GET request: {request.GET}, Session: {request.session}")
    logger.info(f"Received logout request from {request.META.get('REMOTE_ADDR')}")
    return cas.logout(request)
    
def authenticated(request):
    logger.info(f"Incoming GET request: {request.GET}, Session: {request.session}")
    logger.info(f"Request Headers: {request.headers}")

    authenticated = cas.logged_in(request)
    status = "authenticated" if authenticated else "not authenticated"
    logger.info(f"User is {status}. Cookies: {request.COOKIES}")

    response_data = {
        'authenticated': authenticated,
        'username': request.session.get('username', None)
    }
    return JsonResponse(response_data)


#------------------------------- SEARCH COURSES --------------------------------------#

class SearchCourses(View):
    """
    Handles search queries for courses.
    """
    def get(self, request):
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
                logger.info(serialized_courses.data)
                return JsonResponse({"courses": serialized_courses.data})
            
            except Exception as e:
                logger.error(f"An error occurred while searching for courses: {e} \n {traceback.format_exc()}")
                return JsonResponse({"error": "Internal Server Error"}, status=500)
        else:
            return JsonResponse({"courses": []})
