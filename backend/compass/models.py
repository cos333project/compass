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
    code = models.CharField(max_length=4, unique=True, db_index=True, null=True)
    name = models.CharField(max_length=100, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'Department'

class Degree(models.Model):
    """
    TODO: Update comment
    Represents a type of degree offered by a department.

    Fields:
    - department: Foreign key to the associated department.
    - degree_type: Type of degree, either 'AB' (Bachelor of Arts) or 'BSE' (Bachelor of Science in Engineering).
    """
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=10, null=True)
    code = models.CharField(max_length=10, null=True)
    description = models.TextField(null=True)
    urls = models.JSONField(null=True)
    max_counted = models.IntegerField(null=True)
    min_needed = models.IntegerField(default=1)

    class Meta:
        db_table = 'Degree'

class Major(models.Model):
    """
    TODO: Update comment
    Represents a major field of study.

    Fields:
    - id: Auto-generated primary key.
    - code: The short code for the major (e.g., 'COS' for Computer Science).
    - name: The full name of the major.
    - degree_type: The type of degree, either 'AB' or 'BSE'.
    """
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150, null=True)
    code = models.CharField(max_length=10, null=True)
    degree = models.ManyToManyField('Degree')
    description = models.TextField(null=True)
    urls = models.JSONField(null=True)
    max_counted = models.IntegerField(null=True)
    min_needed = models.IntegerField(default=1)

    class Meta:
        db_table = 'Major'

class Minor(models.Model):
    """
    TODO: Update comment
    Represents a minor field of study.

    Fields:
    - id: Auto-generated primary key.
    - code: The short code for the minor.
    - name: The full name of the minor.
    - compatible_with: The type of degree this minor is compatible with ('AB', 'BSE', or 'Both').
    - max_courses_double_dipped: Max number of courses that can be counted toward other minors.
    """
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150, null=True)
    code = models.CharField(max_length=10, null=True)
    description = models.TextField(null=True)
    excluded_majors = models.ManyToManyField('Major')
    excluded_minors = models.ManyToManyField('Minor')
    urls = models.JSONField(null=True)
    apply_by_semester = models.IntegerField(default=6)
    max_counted = models.IntegerField(null=True)
    min_needed = models.IntegerField(default=1)

    class Meta:
        db_table = 'Minor'

class Certificate(models.Model):
    """
    TODO: Update comment
    Represents a certificate program.

    Fields:
    - id: Auto-generated primary key.
    - code: The short code for the certificate.
    - name: The full name of the certificate.
    - departments: The departments offering this certificate.
    """
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150, null=True)
    code = models.CharField(max_length=10, null=True)
    description = models.TextField(null=True)
    excluded_majors = models.ManyToManyField('Major')
    urls = models.JSONField(null=True)
    apply_by_semester = models.IntegerField(default=8)
    max_counted = models.IntegerField(null=True)
    min_needed = models.IntegerField(default=1)
    # to help with phasing out certificates
    # filter out for new users, keep for existing users pursuing it
    active_until = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'Certificate'

#----------------------------------------------------------------------#

class AcademicTerm(models.Model):
    """
    Represents a unique academic term (semester) at the university.

    Fields:
    - term_code: A unique identifier for the term (e.g., '1242' for Fall 2023).
    - suffix: A unique identifier for the term (e.g., 'F2023' for Fall 2023).
    - start_date: Start date of the academic term.
    - end_date: End date of the academic term.

    This table serves two primary purposes:
    1. Track specific semesters when a course is offered.
    2. Provide a reference for 'completed_by_semester' in the Requirement table.
    """
    term_code = models.CharField(max_length=10, unique=True, null=True)
    suffix = models.CharField(max_length=10)  # e.g., "F2023"
    start_date = models.DateField(null=True)
    end_date = models.DateField(null=True)

    class Meta:
        db_table = 'AcademicTerm'

    def __str__(self):
        return self.term_code

class Course(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True)
    guid = models.CharField(max_length=50, null=True)
    course_id = models.CharField(max_length=10, null=True)
    catalog_number = models.CharField(max_length=10, db_index=True, null=True)
    title = models.CharField(max_length=150, db_index=True, null=True)
    description = models.TextField(null=True)
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

    class Meta:
        db_table = 'Course'

    def __str__(self):
        return self.title

class CourseEquivalent(models.Model):
    EQUIVALENCE_TYPES = (
        ('CROSS_LIST', 'Cross-Listing'),
        ('REQUIREMENT', 'Requirement Fulfillment'),
    )

    primary_course = models.ForeignKey('Course', related_name='primary_equivalents', on_delete=models.CASCADE, null=True)
    equivalent_course = models.ForeignKey('Course', related_name='equivalents', on_delete=models.CASCADE, null=True)
    equivalence_type = models.CharField(max_length=12, choices=EQUIVALENCE_TYPES, default='REQUIREMENT')

    class Meta:
        db_table = 'CourseEquivalent'

    def __str__(self):
        primary_title = self.primary_course.title if self.primary_course else "None"
        equivalent_title = self.equivalent_course.title if self.equivalent_course else "None"
        return f"{primary_title} is equivalent to {equivalent_title}"

class Instructor(models.Model):
    emplid = models.CharField(max_length=50, unique=True, null=True)
    first_name = models.CharField(max_length=100, null=True)
    last_name = models.CharField(max_length=100, null=True)
    full_name = models.CharField(max_length=255, null=True)  # Optional, provided by API.

    class Meta:
        db_table = 'Instructor'

    def __str__(self):
        return self.full_name

class Section(models.Model):
    CLASS_TYPE_CHOICES = [
    ('Seminar', 'Seminar'),
    ('Lecture', 'Lecture'),
    ('Precept', 'Precept'),
    ('Unknown', 'Unknown'),
    ('Class', 'Class'),
    ('Studio', 'Studio'),
    ('Drill', 'Drill'),
    ('Lab', 'Lab'),
    ('Ear training', 'Ear training')
]
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True)
    class_number = models.IntegerField(unique=True, null=True)
    class_type = models.CharField(max_length=50, choices=CLASS_TYPE_CHOICES, default="")
    class_section = models.CharField(max_length=10, null=True)
    term = models.ForeignKey(AcademicTerm, on_delete=models.CASCADE, null=True)
    track = models.CharField(max_length=5, null=True)
    seat_reservations = models.CharField(max_length=1)
    instructor = models.ForeignKey(Instructor, on_delete=models.SET_NULL, null=True)
    capacity = models.IntegerField(null=True)
    status = models.CharField(max_length=1, null=True)
    enrollment = models.IntegerField(default=0)

    class Meta:
        db_table = 'Section'

    def __str__(self):
        section_title = self.course.title if self.course else "None"
        term_code = self.term.term_code if self.term else "None"
        return f"{section_title} - {term_code}"

class ClassMeeting(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, null=True)
    meeting_number = models.PositiveIntegerField(null=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=50, null=True)
    days = models.CharField(max_length=20, null=True)
    building_name = models.CharField(max_length=255, null=True)

    class Meta:
        db_table = 'ClassMeeting'

    def __str__(self):
        return f"{self.section} - {self.start_time} to {self.end_time}"

class ClassYearEnrollment(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, null=True)
    class_year = models.IntegerField(null=True)
    enrl_seats = models.IntegerField(null=True)

    class Meta:
        db_table = 'ClassYearEnrollment'

#----------------------------------------------------------------------#

class Requirement(models.Model):
    """
    TODO: Update comment
    Represents an academic requirement for a particular degree.

    Fields:
    - degree: Foreign key to the associated degree.
    - description: Detailed description of the requirement.
    - min_needed: Minimum number of courses/credits needed to fulfill this requirement.
    - deadline: When this requirement should ideally be completed.
    - double_counting_allowed: Whether a course can count for multiple requirements.
    - pdfs_allowed: Whether courses taken as pass/D/fail can fulfill the requirement.
    """

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150, null=True)
    max_counted = models.IntegerField(default=1)
    min_needed = models.IntegerField(default=1)
    explanation = models.TextField(null=True)
    double_counting_allowed = models.BooleanField(null=True)
    max_common_with_major = models.IntegerField(default=0)
    pdfs_allowed = models.IntegerField(default=0)
    min_grade = models.FloatField(default=0.0)
    completed_by_semester = models.IntegerField(default=8)
    parent = models.ForeignKey("self", on_delete=models.CASCADE,
                                 related_name='req_list', null=True)
    degree = models.ForeignKey("Degree", on_delete=models.CASCADE,
                                 related_name='req_list', null=True)
    major = models.ForeignKey("Major", on_delete=models.CASCADE,
                                 related_name='req_list', null=True)
    minor = models.ForeignKey("Minor", on_delete=models.CASCADE,
                                 related_name='req_list', null=True)
    certificate = models.ForeignKey("Certificate", on_delete=models.CASCADE,
                                 related_name='req_list', null=True)
    course_list = models.ManyToManyField('Course', related_name='satisfied_by')
    dept_list = models.JSONField(null=True)
    excluded_course_list = models.ManyToManyField('Course', related_name='not_satisfied_by')
    dist_req = models.JSONField(null=True)
    num_courses = models.IntegerField(null=True)

    class Meta:
        db_table = 'Requirement'

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
    major = models.ForeignKey(Major, on_delete=models.CASCADE, null=True)
    minors = models.ManyToManyField(Minor)
    net_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    university_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    email = models.EmailField(max_length=254, unique=True, null=True, blank=True)
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    class_year = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'CustomUser'

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
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True)
    semester = models.IntegerField(choices=TIMELINE_CHOICES, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')

    class Meta:
        db_table = 'UserCourses'

#----------------------------------------------------------------------#
