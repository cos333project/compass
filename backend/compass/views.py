from django.http import HttpResponse
from utils.cas_client import CASClient

# Create your views here.

from utils.cas_client import CASClient



# To CAS authenticate, use the following code:
# cas_client = CASClient()
# auth_result = cas_client.authenticate(request)
# if auth_result:
#     return auth_result  # This will be a redirect to the CAS login page
# [...]
# return HttpResponse("Hello, authenticated user!") or something like that