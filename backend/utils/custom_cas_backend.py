# # compass/backend/utils/custom_cas_backend.py
# from django_cas_ng.backends import CASBackend
# from django.contrib.auth import get_user_model

# class CustomCASBackend(CASBackend):
#     def authenticate(self, request, ticket, service, **kwargs):
#         """
#         Extends the CASBackend authenticate method to include additional attributes.
#         """
#         # Call the parent authenticate method to get the user and attributes
#         user = super().authenticate(request, ticket, service, **kwargs)

#         # Check if we got both user and attributes from the CAS response
#         if user and attributes:
#             # Map additional attributes to the user object
#             user = self._map_user_attributes(user, attributes)
#             user.save()

#         return user

#     def _map_user_attributes(self, user, attributes):
#         """
#         Map CAS response attributes to Django user attributes.
#         """
#         # Use getattr to fetch additional attributes provided in the CAS response
#         user.net_id = attributes.get('net_id', user.net_id)
#         user.university_id = attributes.get('university_id', user.university_id)
#         user.email = attributes.get('email', user.email)
#         user.first_name = attributes.get('givenname', user.first_name)
#         user.last_name = attributes.get('sn', user.last_name)
#         user.class_year = attributes.get('puclassyear', user.class_year)

#         # Return the user object with updated attributes
#         return user
