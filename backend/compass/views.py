from django.db.models import Q
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.conf import settings
from django.views import View
from django.core.exceptions import ObjectDoesNotExist
from .models import Course
from .serializers import CourseSerializer
import json
from urllib.parse import quote
import traceback
import logging


logger = logging.getLogger(__name__)

#-------------------------------------- LOG IN --------------------------------------------#

class Authentication(View):
    """
    Handles login, logout, and authentication checks.
    """
    def get(self, request, action=None):
        logger.info(f"Incoming GET request: {request.GET}, Session: {request.session}")

        if action == 'login':
            return self.login(request)
        elif action == 'logout':
            return self.logout(request)
        elif action == 'is_authenticated':
            return self.is_authenticated(request)
        else:
            logger.warning(f"Unknown action: {action}")
            return HttpResponse(status=404)

    def login(self, request):
        logger.info(f"Incoming GET request: {request.GET}, Session: {request.session}")

        logger.info(f"Received login request from {request.META.get('REMOTE_ADDR')}")
        try:
            logger.info(f"Redirecting to {settings.CAS_URL}")
            redirect_url = quote(request.build_absolute_uri())
            logger.info(f"Generated redirect URL: {redirect_url}")
            login_url = f"{settings.CAS_URL}login?service={redirect_url}"
            return HttpResponseRedirect(login_url)
        except Exception as e:
            logger.error(f"An error occurred: {e} \n {traceback.format_exc()}")
            return HttpResponse(status=500)
    
    def logout(self, request):
        logger.info(f"Incoming GET request: {request.GET}, Session: {request.session}")

        logger.info(f"Received logout request from {request.META.get('REMOTE_ADDR')}")
        try:
            logout_url = f"{settings.CAS_URL}logout"
            return HttpResponseRedirect(logout_url)
        except Exception as e:
            logger.error(f"An error occurred: {e} \n {traceback.format_exc()}")
            return HttpResponse(status=500)
    
    def is_authenticated(self, request):
        logger.info(f"Incoming GET request: {request.GET}, Session: {request.session}")
        logger.info(f"Request Headers: {request.headers}")

        authenticated = 'username' in request.session
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
                # logger.info(serialized_courses.data)
                return JsonResponse({"courses": serialized_courses.data})
            
            except Exception as e:
                logger.error(f"An error occurred while searching for courses: {e} \n {traceback.format_exc()}")
                return JsonResponse({"error": "Internal Server Error"}, status=500)
        else:
            return JsonResponse({"courses": []})
