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
        # Authentication failed, so we're redirecting to the login page
        if response:
            return response
        
        # Authentication was successful, or not required
        response = self.get_response(request)
        return response
    
    def strip_ticket(self, request) -> str:
        """Strips ticket parameter from the URL."""
        url = request.build_absolute_uri()
        url = sub(r'ticket=[^&]*&?', '', url)
        url = sub(r'\?&?$|&$', '', url)
        return url

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

            first_line, second_line = response[0].decode('utf-8'), response[1].decode('utf-8')
            if not first_line.startswith('yes'):
                return None

            return second_line.strip()
        
        except (HTTPError, URLError) as e:
            self.logger.error(f"Validation failed due to network error: {e}")
            return None

    def authenticate(self, request) -> Optional[HttpResponseRedirect]:
        """Authenticates the user.

        Returns:
            A redirect response object if authentication fails, otherwise None.
        """

        ticket = request.GET.get('ticket')
        service_url = self.strip_ticket(request)
        self.logger.debug(f"Service URL is: {service_url}")
        if ticket:
            username = self.validate(ticket, service_url)
            if username:
                request.session['username'] = username
                user, _ = get_user_model().objects.get_or_create(
                    username=username)
                return None  # Authentication successful

        # Redirect to CAS login if authentication fails
        login_url = f"{self.cas_url}login?service={quote(service_url)}"
        return HttpResponseRedirect(login_url)

    def logout(self, request) -> HttpResponseRedirect:
        """Logs out the user and redirects to the landing page."""
        request.session.flush()
        return HttpResponseRedirect(settings.LANDING_PAGE_URL)
