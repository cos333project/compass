from django.db.models import Q
from django.http import HttpResponseRedirect, JsonResponse, HttpResponseServerError
from django.db.models import Q, F, Value, When, Case
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.conf import settings
from django.views import View
from django.views.decorators.http import require_GET
from django.core.exceptions import ObjectDoesNotExist
from .models import models, Course
from .serializers import CourseSerializer
import json
from urllib.parse import quote
import traceback
import logging
from utils.cas_client import CASClient
import re

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
                logger.error(f"An error occurred while searching for courses: {e} \n {traceback.format_exc()}")
                return JsonResponse({"error": "Internal Server Error"}, status=500)
        else:
            return JsonResponse({"courses": []})
