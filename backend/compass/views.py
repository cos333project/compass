from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# Create your views here.

def login(request):
    """
    Redirects to the CAS login page.
    """
    logger.info(f"Received login request from {request.META.get('REMOTE_ADDR')}")
    try:
        logger.info(f"Redirecting to {settings.CAS_URL}")
    except Exception as e:
        logger.error(f"An error occurred: {e}")
    return HttpResponseRedirect(settings.CAS_URL)

def is_authenticated(request):
    """
    Checks if the user is authenticated.
    """

    logger.info(f"Received is_authenticated request from {request.META.get('REMOTE_ADDR')}")
    authenticated = 'username' in request.session
    if authenticated:
        logger.info("User is authenticated.")
    else:
        logger.info("User is not authenticated.")
    return JsonResponse({'authenticated': authenticated})

def dashboard(request):
    """
    The Compass dashboard view.
    """
    return HttpResponse('This is the dashboard.')
