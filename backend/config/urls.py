"""
URL configuration for the Compass project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from compass import views

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    # CAS Authentication
    path('cas/', views.CAS.as_view(), name='cas'),
    # Profile
    path('profile/', views.profile, name='profile'),
    path('update_profile/', views.update_profile, name='update_profile'),
    path('course_details/', views.course_details, name='course_details'),
    path('course_comments/', views.course_comments, name='course_cpmments'),
    path('csrf/', views.csrf, name='csrf'),
    # Canvas
    path('search/', views.SearchCourses.as_view(), name='search'),
    path('fetch_courses/', views.GetUserCourses.as_view(), name='fetch_courses'),
    path('update_courses/', views.update_courses, name='update_courses'),
    path('manually_settle/', views.manually_settle, name='manually_settle'),
    path('check_requirements/', views.check_requirements, name='check_requirements'),
    path('update_user/', views.update_user, name='update_user'),
    path('requirement_info/', views.requirement_info, name='requirement_info'),
]
