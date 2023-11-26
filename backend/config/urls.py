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
import django_cas_ng.views
from compass import views

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    # CAS Authentication
    path('login/', django_cas_ng.views.LoginView.as_view(), name='login'),
    path('logout/', django_cas_ng.views.LogoutView.as_view(), name='logout'),
    path('authenticate/', views.authenticate, name='authenticate'),
    # Profile
    path('profile/', views.profile, name='profile'),
    path('update_profile/', views.update_profile, name='update_profile'),
    # Canvas
    path('search/', views.SearchCourses.as_view(), name='search'),
    path('get_user_courses/', views.GetUserCourses.as_view(), name='get_user_courses'),
    path('update_user_courses/', views.update_user_courses, name='update_user_courses'),
    path('check_requirements/', views.check_requirements, name='check_requirements'),
    path('update_user/', views.update_user, name='update_settings'),
]
