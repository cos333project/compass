from django.db import models
from django.contrib.auth.models import AbstractUser

# Initial models, will likely be updated as we go!

# Choices for the role field in the CustomUser and Contact models.
ROLE_CHOICES = (
    ('admin', 'Administrator'),
    ('student', 'Student'),
)

# Choices for degree_type
DEGREE_TYPE_CHOICES = (
    ('AB', 'Bachelor of Arts'),
    ('BSE', 'Bachelor of Science in Engineering'),
)

class CustomUser(AbstractUser):
    """
    Custom User model that extends Django's built-in AbstractUser.
    Adds a 'role' field to differentiate between admins and students.

    Fields:
    - role: The role of the user, either 'admin' or 'student'.
    """
    role = models.CharField(max_length=25, choices=ROLE_CHOICES, default='student')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Department(models.Model):
    """
    Represents an academic department at the university.

    Fields:
    - code: The department's short code (e.g., 'COS' for Computer Science).
    - name: The full name of the department (e.g., 'Computer Science').
    """
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Contact(models.Model):
    """
    Represents a contact person, either a student or admin, within a department.

    Fields:
    - department: Foreign key to the department this contact is associated with.
    - name: The name of the contact.
    - role: The role of the contact, either 'admin' or 'student'.
    - email: The contact's email address.
    """
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    role = models.CharField(max_length=25, choices=ROLE_CHOICES)
    email = models.EmailField(unique=True)

class Degree(models.Model):
    """
    Represents a type of degree offered by a department.

    Fields:
    - department: Foreign key to the associated department.
    - degree_type: Type of degree, either 'AB' (Bachelor of Arts) or 'BSE' (Bachelor of Science in Engineering).
    """
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    degree_type = models.CharField(max_length=10)

class Requirement(models.Model):
    """
    Represents an academic requirement for a particular degree.

    Fields:
    - degree: Foreign key to the associated degree.
    - description: Detailed description of the requirement.
    - min_needed: Minimum number of courses/credits needed to fulfill this requirement.
    - completed_by_semester: When this requirement should ideally be completed.
    - double_counting_allowed: Whether a course can count for multiple requirements.
    - pdfs_allowed: Whether courses taken as pass/D/fail can fulfill the requirement.
    """
    degree = models.ForeignKey(Degree, on_delete=models.CASCADE)
    description = models.TextField()
    min_needed = models.IntegerField()
    completed_by_semester = models.CharField(max_length=20)
    double_counting_allowed = models.BooleanField()
    pdfs_allowed = models.BooleanField()
    courses = models.ManyToManyField('Course')

class Course(models.Model):
    """
    Represents a course that can be used to fulfill various academic requirements.

    Fields:
    - course_code: The code of the course, e.g., 'COS 333'.
    - course_name: The name of the course, e.g., 'Computer Science: An Interdisciplinary Approach'.
    """
    course_code = models.CharField(max_length=10, unique=True)
    course_name = models.CharField(max_length=100)

class Major(models.Model):
    """
    Represents a major field of study.

    Fields:
    - id: Auto-generated primary key.
    - code: The short code for the major (e.g., 'COS' for Computer Science).
    - name: The full name of the major.
    - degree_type: The type of degree, either 'AB' or 'BSE'.
    """
    id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=10)
    name = models.CharField(max_length=100)
    degree_type = models.CharField(max_length=3)  # "AB", "BSE"

class Minor(models.Model):
    """
    Represents a minor field of study.

    Fields:
    - id: Auto-generated primary key.
    - code: The short code for the minor.
    - name: The full name of the minor.
    - compatible_with: The type of degree this minor is compatible with ('AB', 'BSE', or 'Both').
    """
    id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=10)
    name = models.CharField(max_length=100)
    compatible_with = models.CharField(max_length=10)  # "AB", "BSE", or "Both"

class Certificate(models.Model):
    """
    Represents a certificate program.

    Fields:
    - id: Auto-generated primary key.
    - code: The short code for the certificate.
    - name: The full name of the certificate.
    - departments: The departments offering this certificate.
    """
    id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=10)
    name = models.CharField(max_length=100)
    departments = models.ManyToManyField(Department)

class MajorRequirement(models.Model):
    """
    Represents a specific requirement for a major.

    Fields:
    - id: Auto-generated primary key.
    - major: Foreign key to the associated major.
    - description: Detailed description of the requirement.
    - min_needed: Minimum number of courses or credits needed to fulfill this requirement.
    """
    id = models.AutoField(primary_key=True)
    major = models.ForeignKey(Major, on_delete=models.CASCADE)
    description = models.TextField()
    min_needed = models.IntegerField()

class MinorRequirement(models.Model):
    """
    Represents a specific requirement for a minor.

    Fields:
    - id: Auto-generated primary key.
    - minor: Foreign key to the associated minor.
    - description: Detailed description of the requirement.
    - min_needed: Minimum number of courses or credits needed to fulfill this requirement.
    """
    id = models.AutoField(primary_key=True)
    minor = models.ForeignKey(Minor, on_delete=models.CASCADE)
    description = models.TextField()
    min_needed = models.IntegerField()

class CertificateRequirement(models.Model):
    """
    Represents a specific requirement for a certificate program.

    Fields:
    - id: Auto-generated primary key.
    - certificate: Foreign key to the associated certificate.
    - description: Detailed description of the requirement.
    - min_needed: Minimum number of courses or credits needed to fulfill this requirement.
    """
    id = models.AutoField(primary_key=True)
    certificate = models.ForeignKey(Certificate, on_delete=models.CASCADE)
    description = models.TextField()
    min_needed = models.IntegerField()

class MinorCourse(models.Model):
    """
    Represents a course that can fulfill a specific minor requirement.

    Fields:
    - id: Auto-generated primary key.
    - requirement: Foreign key to the associated minor requirement.
    - course_code: The code of the course, e.g., 'COS 333'.
    - course_name: The name of the course, e.g., 'Computer Science: An Interdisciplinary Approach'.
    """
    id = models.AutoField(primary_key=True)
    requirement = models.ForeignKey(MinorRequirement, on_delete=models.CASCADE)
    course_code = models.CharField(max_length=10)
    course_name = models.CharField(max_length=100)

class CertificateCourse(models.Model):
    """
    Represents a course that can fulfill a specific certificate requirement.

    Fields:
    - id: Auto-generated primary key.
    - requirement: Foreign key to the associated certificate requirement.
    - course_code: The code of the course, e.g., 'COS 333'.
    - course_name: The name of the course, e.g., 'Computer Science: An Interdisciplinary Approach'.
    """
    id = models.AutoField(primary_key=True)
    requirement = models.ForeignKey(CertificateRequirement, on_delete=models.CASCADE)
    course_code = models.CharField(max_length=10)
    course_name = models.CharField(max_length=100)
