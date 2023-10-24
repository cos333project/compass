from django.db import models
from django.contrib.auth.models import AbstractUser

#----------------------------------------------------------------------#

# Choices for degree_type
DEGREE_TYPE_CHOICES = (
    ('AB', 'Bachelor of Arts'),
    ('BSE', 'Bachelor of Science in Engineering'),
)

# Mapping from semester number to semester name
TIMELINE_CHOICES = (
        (1, 'freshman fall'),
        (2, 'freshman spring'),
        (3, 'sophomore fall'),
        (4, 'sophomore spring'),
        (5, 'junior fall'),
        (6, 'junior spring'),
        (7, 'senior fall'),
        (8, 'senior spring'),
    )

#----------------------------------------------------------------------#

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

class Degree(models.Model):
    """
    Represents a type of degree offered by a department.

    Fields:
    - department: Foreign key to the associated department.
    - degree_type: Type of degree, either 'AB' (Bachelor of Arts) or 'BSE' (Bachelor of Science in Engineering).
    """
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    degree_type = models.CharField(choices=DEGREE_TYPE_CHOICES, max_length=10)

#----------------------------------------------------------------------#
    
class CourseBucket(models.Model):
    """
    Represents a classification of courses within a major or minor.
    
    Fields:
    - name: The name of this bucket, e.g., 'Core Courses', 'Electives'.
    - description: A textual description outlining the purpose or guidelines for this bucket.
    - courses: Many-to-many relationship with courses that fall into this bucket.
    - category: Optional field to further categorize the bucket, e.g., 'Theory', 'Application'.
    """
    name = models.CharField(max_length=50)
    description = models.TextField()
    courses = models.ManyToManyField('Course')
    category = models.CharField(max_length=50, null=True, blank=True)
    # add dept/program

class IndependentWork(models.Model):
    """
    Represents independent academic work required for a degree, such as junior papers or senior theses.

    Fields:
    - degree: Foreign key to the associated degree.
    - description: Detailed textual description outlining the guidelines or expectations for the independent work.
    - type: The type of independent work. Choices are 'JP' for Junior Paper, 'ST' for Senior Thesis, and 'PR' for Project.
    - completed_by_semester: The semester by which this independent work should ideally be completed.
    """
    TYPE_CHOICES = (
        ('JP', 'Junior Paper'),
        ('ST', 'Senior Thesis'),
        ('PR', 'Project'),
        ('M', 'Minor')
    )

    degree = models.ForeignKey(Degree, on_delete=models.CASCADE)
    description = models.TextField()
    type = models.CharField(max_length=2, choices=TYPE_CHOICES)
    completed_by_semester = models.IntegerField(choices=TIMELINE_CHOICES)

#----------------------------------------------------------------------#

class AcademicTerm(models.Model):
    """
    Represents a unique academic term (semester) at the university.

    Fields:
    - term_code: A unique identifier for the term (e.g., 'F2023' for Fall 2023).
    - start_date: Start date of the academic term.
    - end_date: End date of the academic term.

    This table serves two primary purposes:
    1. Track specific semesters when a course is offered.
    2. Provide a reference for 'completed_by_semester' in the Requirement table.
    """
    term_code = models.CharField(max_length=10, unique=True)
    suffix = models.CharField(max_length=10)  # e.g., "F2023"
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return self.term_code

class Course(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    guid = models.CharField(max_length=50)
    course_id = models.CharField(max_length=10)
    catalog_number = models.CharField(max_length=10)
    title = models.CharField(max_length=150)
    description = models.TextField()
    drop_consent = models.CharField(max_length=1, blank=True, null=True)
    add_consent = models.CharField(max_length=1, blank=True, null=True)
    web_address = models.URLField(max_length=255, blank=True, null=True)
    pu_flag = models.CharField(max_length=1, blank=True, null=True)
    transcript_title = models.CharField(max_length=150, blank=True, null=True)
    long_title = models.CharField(max_length=250, blank=True, null=True)
    distribution_area_long = models.CharField(max_length=150, blank=True, null=True)
    distribution_area_short = models.CharField(max_length=10, blank=True, null=True)
    reading_writing_assignment = models.TextField(blank=True, null=True)
    grading_basis = models.CharField(max_length=5, blank=True, null=True)
    reading_list = models.TextField(blank=True, null=True)
    drop_consent = models.CharField(max_length=1, blank=True, null=True)
    add_consent = models.CharField(max_length=1, blank=True, null=True)
    web_address = models.URLField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.title

class CourseEquivalent(models.Model):
    EQUIVALENCE_TYPES = (
        ('CROSS_LIST', 'Cross-Listing'),
        ('REQUIREMENT', 'Requirement Fulfillment'),
    )

    primary_course = models.ForeignKey('Course', related_name='primary_equivalents', on_delete=models.CASCADE)
    equivalent_course = models.ForeignKey('Course', related_name='equivalents', on_delete=models.CASCADE)
    equivalence_type = models.CharField(max_length=12, choices=EQUIVALENCE_TYPES, default='REQUIREMENT')

    def __str__(self):
        return f"{self.primary_course.title} is equivalent to {self.equivalent_course.title}"

class Instructor(models.Model):
    emplid = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    full_name = models.CharField(max_length=255)  # Optional, provided by API.

    def __str__(self):
        return self.full_name

class Section(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    term = models.ForeignKey(AcademicTerm, on_delete=models.CASCADE)
    track = models.CharField(max_length=5)  # e.g. UGRD/Grad
    seat_reservations = models.CharField(max_length=1)
    instructor = models.ForeignKey(Instructor, on_delete=models.SET_NULL, null=True)  # Changed to ForeignKey
    class_number = models.IntegerField(unique=True)
    capacity = models.IntegerField()
    enrollment = models.IntegerField()

    def __str__(self):
        return f"{self.course.title} - {self.term.term_code}"

class ClassMeeting(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    meeting_number = models.PositiveIntegerField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=50)
    days = models.CharField(max_length=20) 
    building_code = models.CharField(max_length=50) 
    building_name = models.CharField(max_length=255)
    
    def __str__(self):
        return f"{self.section} - {self.start_time} to {self.end_time}"

class ClassYearEnrollment(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    class_year = models.IntegerField()
    enrl_seats = models.IntegerField()

#----------------------------------------------------------------------#

class Requirement(models.Model):
    """
    Represents an academic requirement for a particular degree.

    Fields:
    - degree: Foreign key to the associated degree.
    - description: Detailed description of the requirement.
    - min_needed: Minimum number of courses/credits needed to fulfill this requirement.
    - deadline: When this requirement should ideally be completed.
    - double_counting_allowed: Whether a course can count for multiple requirements.
    - pdfs_allowed: Whether courses taken as pass/D/fail can fulfill the requirement.
    """
    
    OPERATOR_CHOICES = (
        ('AND', 'And'),
        ('OR', 'Or'),
    )
    
    degree = models.ForeignKey(Degree, on_delete=models.CASCADE)
    description = models.TextField()
    min_needed = models.IntegerField()
    deadline = models.IntegerField(choices=TIMELINE_CHOICES, null=True, blank=True)
    double_counting_allowed = models.BooleanField()
    # max counted between minors, majors
    pdfs_allowed = models.BooleanField()
    courses = models.ManyToManyField('Course')
    operator = models.CharField(max_length=3, choices=OPERATOR_CHOICES, default='AND')
    class Meta:
        abstract = True

class Prerequisites(models.Model):
    course = models.ForeignKey(Course, related_name='course_prerequisites', on_delete=models.CASCADE)
    prerequisite = models.ForeignKey(Course, related_name='required_by_courses', on_delete=models.CASCADE)
    required = models.BooleanField(default=True)

#----------------------------------------------------------------------#

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
    degree_type = models.CharField(choices=DEGREE_TYPE_CHOICES, max_length=3)

class MajorRequirement(Requirement):
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
    course_bucket = models.ForeignKey(CourseBucket, on_delete=models.SET_NULL, null=True, blank=True)
    min_needed = models.IntegerField()

#----------------------------------------------------------------------#

class Minor(models.Model):
    """
    Represents a minor field of study.

    Fields:
    - id: Auto-generated primary key.
    - code: The short code for the minor.
    - name: The full name of the minor.
    - compatible_with: The type of degree this minor is compatible with ('AB', 'BSE', or 'Both').
    - max_courses_double_dipped: Max number of courses that can be counted toward other minors.
    """
    id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=10)
    name = models.CharField(max_length=100)
    compatible_with = models.CharField(max_length=10)  # "AB", "BSE", or "Both"
    max_courses_double_dipped = models.IntegerField(null=True, blank=True)
    max_courses_from_major = models.IntegerField(default=2)

class MinorRequirement(Requirement):
    """
    Represents a specific requirement for a minor.

    Fields:
    - id: Auto-generated primary key.
    - minor: Foreign key to the associated minor.
    - description: Detailed description of the requirement.
    - min_needed: Minimum number of courses or credits needed to fulfill this requirement.
    - max_courses_from_major: Max number of courses from a major that can be counted towards this minor.
    """
    id = models.AutoField(primary_key=True)
    minor = models.ForeignKey(Minor, related_name="requirements", on_delete=models.CASCADE)
    description = models.TextField()
    course_bucket = models.ForeignKey(CourseBucket, on_delete=models.SET_NULL, null=True, blank=True)
    min_needed = models.IntegerField()

#----------------------------------------------------------------------#

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
    # to help with phasing out certificates
    # filter out for new users, keep for existing users pursuing it
    active_until = models.DateField(null=True, blank=True)

class CertificateRequirement(Requirement):
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
    course_bucket = models.ForeignKey(CourseBucket, on_delete=models.SET_NULL, null=True, blank=True)
    min_needed = models.IntegerField()

#----------------------------------------------------------------------#

class CustomUser(AbstractUser):
    """
    Custom User model that extends Django's built-in AbstractUser.
    Adds a 'role' field to differentiate between admins and students.

    Fields:
    - role: The role of the user, either 'admin' or 'student'.
    """

    ROLE_CHOICES = (
        ('admin', 'Administrator'),
        ('student', 'Student'),
    )
    
    role = models.CharField(max_length=25, choices=ROLE_CHOICES, default='student')
    major = models.ForeignKey(Major, on_delete=models.CASCADE)
    minors = models.ManyToManyField(Minor)
    # take in more than one minor
    class_year = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class UserCourses(models.Model):
    """
    Maps courses a user plans to take or has taken.
    
    Fields:
    - user: The student who is taking or has taken the course.
    - course: The course the student is taking or has taken.
    - semester: The semester when the course is or was taken.
    - status: Whether the course is planned, in-progress, or completed.
    """
    STATUS_CHOICES = (
        ('planned', 'Planned'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
    )
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    semester = models.IntegerField(choices=TIMELINE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')

#----------------------------------------------------------------------#
