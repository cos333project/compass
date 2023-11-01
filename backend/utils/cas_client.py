from urllib.request import urlopen
from urllib.parse import quote
from re import sub
from typing import Optional
from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import HttpResponseRedirect
from urllib.parse import urlencode
from urllib.error import URLError, HTTPError
import logging

class CASClient:
    """CASClient for seamless CAS authentication in Django.

    Attributes:
        cas_url: The CAS server URL.
        logger: Logger for the CASClient.
    """
    def __init__(self, get_response):
        self.get_response = get_response
        self.cas_url = settings.CAS_URL
        self.logger = logging.getLogger(__name__)

    def __call__(self, request):
        response = self.authenticate(request)
        return response if response else self.get_response(request)
    
    def logged_in(self, request) -> bool:
        return 'username' in request.session
    
    def strip_ticket(self, request) -> str:
        """Strips ticket parameter from the URL."""
        url = request.build_absolute_uri()
        url = request.build_absolute_uri()
        return sub(r'\?&?$|&$', '', sub(r'ticket=[^&]*&?', '', url))

    def validate(self, ticket: str, service_url: str) -> Optional[str]:
        """Validates the CAS ticket.

        Args:
            ticket: CAS ticket string.
            service_url: Service URL string.
            timeout: Timeout in seconds.
        
        Returns:
            str if successful, None otherwise.
            
        Returns:
            The username if validation is successful, otherwise None.
        """
        try:
            params = {'service': service_url, 'ticket': ticket}
            val_url = f"{self.cas_url}validate?{urlencode(params)}"
            response = urlopen(val_url, timeout=5).readlines()

            if len(response) != 2:
                self.logger.warning("Validation failed: Unexpected response length.")
                return None

            first_line, second_line = map(str.strip, map(bytes.decode, response))
            return second_line if first_line.startswith('yes') else None
        
        except (HTTPError, URLError) as e:
            self.logger.error(f"Validation failed due to network error: {e}")
            return None

    def authenticate(self, request) -> Optional[HttpResponseRedirect]:
        """Authenticates the user.

        Returns:
            A redirect response object if authentication fails, otherwise None.
        """
        self.logger.debug(f"Starting authentication process for {request.path}")

        # User already authenticated
        if 'username' in request.session:
            self.logger.debug("User already authenticated.")
            return None

        ticket = request.GET.get('ticket')
        service_url = self.strip_ticket(request)

        if ticket:
            username = self.validate(ticket, service_url)
            if username:
                request.session['username'] = username
                # user, created = get_user_model().objects.get_or_create(
                #     username=username, 
                #     defaults={'role': 'student'}
                # )
                self.logger.debug(f"Authentication successful for {username}")
                return None  # Authentication successful

        protected_routes = ['/dashboard']
        if request.path in protected_routes:
            login_url = f"{self.cas_url}login?service={quote(service_url)}"
            self.logger.debug(f"Authentication failed. Redirecting to {login_url}")
            return HttpResponseRedirect(login_url)
        
        self.logger.debug("Route doesn't require authentication or is an auth check route. Not redirecting.")
        return None

    def logout(self, request) -> HttpResponseRedirect:
        """Logs out the user and redirects to the landing page."""
        request.session.flush()
        return HttpResponseRedirect(settings.LANDING_PAGE_URL)
