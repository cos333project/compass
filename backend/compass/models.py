from django.contrib.auth.models import AbstractUser
from django.db import models

# ----------------------------------------------------------------------#

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

# ----------------------------------------------------------------------#


class Department(models.Model):
    """
    Represents an academic department at the university.

    Fields:
    - code: The department's short code (e.g., 'COS' for Computer Science).
    - name: The full name of the department (e.g., 'Computer Science').
    """

    code = models.CharField(max_length=4, unique=True, db_index=True, null=True)
    name = models.CharField(max_length=100, db_index=True, null=True)
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
    name = models.CharField(max_length=10, db_index=True, null=True)
    code = models.CharField(max_length=10, db_index=True, null=True)
    description = models.TextField(db_index=True, null=True)
    urls = models.JSONField(db_index=True, null=True)
    max_counted = models.IntegerField(db_index=True, null=True)
    min_needed = models.IntegerField(db_index=True, default=1)

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
    name = models.CharField(max_length=150, db_index=True, null=True)
    code = models.CharField(max_length=10, db_index=True, null=True)
    degree = models.ManyToManyField('Degree')
    description = models.TextField(db_index=True, null=True)
    urls = models.JSONField(db_index=True, null=True)
    max_counted = models.IntegerField(db_index=True, null=True)
    min_needed = models.IntegerField(db_index=True, default=1)

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
    name = models.CharField(max_length=150, db_index=True, null=True)
    code = models.CharField(max_length=10, db_index=True, null=True)
    description = models.TextField(db_index=True, null=True)
    excluded_majors = models.ManyToManyField('Major')
    excluded_minors = models.ManyToManyField('Minor')
    urls = models.JSONField(db_index=True, null=True)
    apply_by_semester = models.IntegerField(default=6)
    max_counted = models.IntegerField(db_index=True, null=True)
    min_needed = models.IntegerField(db_index=True, default=1)

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
    name = models.CharField(max_length=150, db_index=True, null=True)
    code = models.CharField(max_length=10, db_index=True, null=True)
    description = models.TextField(db_index=True, null=True)
    excluded_majors = models.ManyToManyField('Major')
    urls = models.JSONField(db_index=True, null=True)
    apply_by_semester = models.IntegerField(default=8)
    max_counted = models.IntegerField(db_index=True, null=True)
    min_needed = models.IntegerField(db_index=True, default=1)
    # to help with phasing out certificates
    # filter out for new users, keep for existing users pursuing it
    active_until = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'Certificate'


# ----------------------------------------------------------------------#


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

    term_code = models.CharField(max_length=10, db_index=True, unique=True, null=True)
    suffix = models.CharField(max_length=10, db_index=True)  # e.g., "F2023"
    start_date = models.DateField(null=True)
    end_date = models.DateField(null=True)

    class Meta:
        db_table = 'AcademicTerm'

    def __str__(self):
        return self.term_code


class Course(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True)
    guid = models.CharField(max_length=50, db_index=True, null=True)
    course_id = models.CharField(max_length=15, db_index=True, null=True)
    catalog_number = models.CharField(max_length=10, db_index=True, null=True)
    title = models.CharField(max_length=150, db_index=True, null=True)
    description = models.TextField(db_index=True, null=True)
    drop_consent = models.CharField(max_length=1, db_index=True, blank=True, null=True)
    add_consent = models.CharField(max_length=1, db_index=True, blank=True, null=True)
    web_address = models.URLField(max_length=255, db_index=True, blank=True, null=True)
    transcript_title = models.CharField(max_length=150, blank=True, null=True)
    long_title = models.CharField(max_length=250, db_index=True, blank=True, null=True)
    distribution_area_long = models.CharField(
        max_length=150, db_index=True, blank=True, null=True
    )
    distribution_area_short = models.CharField(
        max_length=10, db_index=True, blank=True, null=True
    )
    reading_writing_assignment = models.TextField(blank=True, db_index=True, null=True)
    grading_basis = models.CharField(max_length=5, blank=True, db_index=True, null=True)
    reading_list = models.TextField(blank=True, db_index=True, null=True)

    class Meta:
        db_table = 'Course'

    def __str__(self):
        return self.title


class CourseEquivalent(models.Model):
    EQUIVALENCE_TYPES = (
        ('CROSS_LIST', 'Cross-Listing'),
        ('REQUIREMENT', 'Requirement Fulfillment'),
    )

    primary_course = models.ForeignKey(
        'Course',
        related_name='primary_equivalents',
        on_delete=models.CASCADE,
        null=True,
    )
    equivalent_course = models.ForeignKey(
        'Course', related_name='equivalents', on_delete=models.CASCADE, null=True
    )
    equivalence_type = models.CharField(
        max_length=12, choices=EQUIVALENCE_TYPES, default='REQUIREMENT'
    )

    class Meta:
        db_table = 'CourseEquivalent'

    def __str__(self):
        primary_title = self.primary_course.title if self.primary_course else 'None'
        equivalent_title = (
            self.equivalent_course.title if self.equivalent_course else 'None'
        )
        return f'{primary_title} is equivalent to {equivalent_title}'


class Instructor(models.Model):
    """
    Represents an instructor in the university's course management system.

    Attributes:
        emplid (CharField): Unique employee ID for the instructor. Nullable.
        first_name (CharField): Instructor's first name. Nullable.
        last_name (CharField): Instructor's last name. Nullable.
        full_name (CharField): Full name of the instructor. Nullable and optionally provided by API.

    Meta:
        db_table: 'Instructor'

    Methods:
        __str__: Returns the full name of the instructor.
    """

    emplid = models.CharField(max_length=50, unique=True, db_index=True, null=True)
    first_name = models.CharField(max_length=100, db_index=True, null=True)
    last_name = models.CharField(max_length=100, db_index=True, null=True)
    full_name = models.CharField(
        max_length=255, null=True
    )  # Optional, provided by API.

    class Meta:
        db_table = 'Instructor'

    def __str__(self):
        return self.full_name


class Section(models.Model):
    """
    Represents a specific section of a course in the context of Princeton University's course planning system.

    Attributes:
        course (ForeignKey): The course to which this section belongs. Nullable.
        class_number (IntegerField): Unique number identifying the class. Nullable.
        class_type (CharField): Type of class (e.g., Seminar, Lecture). Default is empty.
        class_section (CharField): Section number of the class. Nullable.
        term (ForeignKey): Academic term in which the section is offered. Nullable.
        track (CharField): Track code for the section. Nullable.
        seat_reservations (CharField): Seat reservation status. Nullable.
        instructor (ForeignKey): Instructor for the section. Nullable.
        capacity (IntegerField): Maximum capacity of the section. Nullable.
        status (CharField): Current status of the section (e.g., open, closed). Nullable.
        enrollment (IntegerField): Current enrollment number. Defaults to 0.

    Meta:
        db_table: 'Section'

    Methods:
        __str__: Returns a string representation of the section, including course title and term code.
    """

    CLASS_TYPE_CHOICES = [
        ('Seminar', 'Seminar'),
        ('Lecture', 'Lecture'),
        ('Precept', 'Precept'),
        ('Unknown', 'Unknown'),
        ('Class', 'Class'),
        ('Studio', 'Studio'),
        ('Drill', 'Drill'),
        ('Lab', 'Lab'),
        ('Ear training', 'Ear training'),
    ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True)
    class_number = models.IntegerField(unique=True, db_index=True, null=True)
    class_type = models.CharField(
        max_length=50, choices=CLASS_TYPE_CHOICES, db_index=True, default=''
    )
    class_section = models.CharField(max_length=10, db_index=True, null=True)
    term = models.ForeignKey(
        AcademicTerm, on_delete=models.CASCADE, db_index=True, null=True
    )
    track = models.CharField(max_length=5, db_index=True, null=True)
    seat_reservations = models.CharField(max_length=1, db_index=True, null=True)
    instructor = models.ForeignKey(Instructor, on_delete=models.SET_NULL, null=True)
    capacity = models.IntegerField(db_index=True, null=True)
    status = models.CharField(max_length=10, db_index=True, null=True)
    enrollment = models.IntegerField(db_index=True, default=0)

    class Meta:
        db_table = 'Section'

    def __str__(self):
        section_title = self.course.title if self.course else 'None'
        term_code = self.term.term_code if self.term else 'None'
        return f'{section_title} - {term_code}'


class ClassMeeting(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, null=True)
    meeting_number = models.PositiveIntegerField(db_index=True, null=True)
    start_time = models.TimeField(db_index=True, null=True)
    end_time = models.TimeField(db_index=True, null=True)
    room = models.CharField(max_length=50, db_index=True, null=True)
    days = models.CharField(max_length=20, db_index=True, null=True)
    building_name = models.CharField(max_length=255, db_index=True, null=True)

    class Meta:
        db_table = 'ClassMeeting'

    def __str__(self):
        return f'{self.section} - {self.start_time} to {self.end_time}'


class ClassYearEnrollment(models.Model):
    section = models.ForeignKey(
        Section, on_delete=models.CASCADE, db_index=True, null=True
    )
    class_year = models.IntegerField(null=True)
    enrl_seats = models.IntegerField(null=True)

    class Meta:
        db_table = 'ClassYearEnrollment'


# ----------------------------------------------------------------------#


class Requirement(models.Model):
    """
    Represents an academic requirement in the context of Princeton University's course planning system.

    Attributes:
        id (AutoField): Primary key, auto-incrementing.
        name (CharField): Name of the requirement. Nullable.
        max_counted (IntegerField): Max courses counted towards this requirement.
        min_needed (IntegerField): Min courses needed to fulfill this requirement.
        explanation (TextField): Explanation of the requirement. Nullable.
        double_counting_allowed (BooleanField): If double counting is allowed. Nullable.
        max_common_with_major (IntegerField): Max common courses with major.
        pdfs_allowed (IntegerField): If PDF (Pass/D/Fail) courses are allowed.
        min_grade (FloatField): Min grade required for this requirement.
        completed_by_semester (IntegerField): Semester by which requirement should be completed.
        parent (ForeignKey): Reference to parent requirement, if any. Nullable.
        degree (ForeignKey): Associated degree. Nullable.
        major (ForeignKey): Associated major. Nullable.
        minor (ForeignKey): Associated minor. Nullable.
        certificate (ForeignKey): Associated certificate. Nullable.
        course_list (ManyToManyField): Courses satisfying this requirement.
        dept_list (JSONField): Departments associated with this requirement. Nullable.
        excluded_course_list (ManyToManyField): Courses not satisfying this requirement.
        dist_req (JSONField): Distribution requirements. Nullable.
        num_courses (IntegerField): Number of courses for this requirement. Nullable.

    Meta:
        db_table: Custom 'Requirement' name for readability
    """

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150, db_index=True, null=True)
    max_counted = models.IntegerField(default=1, db_index=True)
    min_needed = models.IntegerField(default=1, db_index=True)
    explanation = models.TextField(db_index=True, null=True)
    double_counting_allowed = models.BooleanField(db_index=True, null=True)
    max_common_with_major = models.IntegerField(db_index=True, default=0)
    pdfs_allowed = models.IntegerField(db_index=True, default=0)
    min_grade = models.FloatField(db_index=True, default=0.0)
    completed_by_semester = models.IntegerField(db_index=True, default=8)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        related_name='req_list',
        null=True,
    )
    degree = models.ForeignKey(
        'Degree',
        on_delete=models.CASCADE,
        related_name='req_list',
        null=True,
    )
    major = models.ForeignKey(
        'Major',
        on_delete=models.CASCADE,
        related_name='req_list',
        null=True,
    )
    minor = models.ForeignKey(
        'Minor',
        on_delete=models.CASCADE,
        related_name='req_list',
        null=True,
    )
    certificate = models.ForeignKey(
        'Certificate',
        on_delete=models.CASCADE,
        related_name='req_list',
        null=True,
    )
    course_list = models.ManyToManyField(
        'Course', db_index=True, related_name='satisfied_by'
    )
    dept_list = models.JSONField(db_index=True, null=True)
    excluded_course_list = models.ManyToManyField(
        'Course', related_name='not_satisfied_by'
    )
    dist_req = models.JSONField(db_index=True, null=True)
    num_courses = models.IntegerField(db_index=True, null=True)

    class Meta:
        db_table = 'Requirement'


# --------------------------------------------------------------------------------------#


class CustomUser(AbstractUser):
    """
    Extends Django's built-in AbstractUser to include additional
    fields specific to the context of Compass at Princeton University.

    Attributes:
        role (str): The role of the user within Compass.
        major (ForeignKey): The user's major. Nullable.
        minors (ManyToManyField): The user's minor(s). Nullable.
        net_id (str): The user's Princeton Net ID. Nullable.
        email (EmailField): The user's email address. Unique and nullable.
        first_name (str): The user's first name. Nullable.
        last_name (str): The user's last name. Nullable.
        class_year (int): The user's class year, represented as an integer. Nullable.
        created_at (DateTimeField): Timestamp indicating when the user record was created.
        updated_at (DateTimeField): Timestamp indicating the last update to the user record.

    Meta:
        db_table: Custom 'User' name for readability
    """

    ROLE_CHOICES = (
        ('admin', 'Administrator'),
        ('student', 'Student'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    major = models.ForeignKey(Major, on_delete=models.CASCADE, null=True)
    minors = models.ManyToManyField(Minor)
    net_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    email = models.EmailField(max_length=100, unique=True, null=True, blank=True)
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    class_year = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'CustomUser'


class UserCourses(models.Model):
    """
    Represents the courses the user planned on the Dashboard page.

    Attributes:
        user (ForeignKey): Indicates which user the course is associated with.
        course (ForeignKey): Indicates which course is being referred to.
        semester (IntegerField): Indicates the planned semester for the course.

    Meta:
        db_table: Custom 'UserCourses' name for readability
    """

    STATUS_CHOICES = (
        ('planned', 'Planned'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
    )

    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, db_index=True, null=True
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, db_index=True, null=True
    )
    semester = models.IntegerField(choices=TIMELINE_CHOICES, db_index=True, null=True)
    requirement = models.ForeignKey(
        Requirement, on_delete=models.CASCADE, db_index=True, null=True
    )

    class Meta:
        db_table = 'UserCourses'


class CourseEvaluations(models.Model):
    """
    Stores student course evaluations, including various quality metrics and recommendations.

    Attributes:
        - course (ForeignKey): Indicates which course is being evaluated.
        - term (ForeignKey): Indicates the term during which the course was evaluated.
        - quality_of_course (FloatField): Numeric rating of the overall course quality. Nullable.
        - quality_of_lectures (FloatField): Numeric rating of the lecture quality. Nullable.
        - quality_of_readings (FloatField): Numeric rating of the course readings. Nullable.
        - quality_of_written_assignments (FloatField): Numeric rating of the written assignments. Nullable.
        - recommend_to_other_students (FloatField): Numeric rating of the course. Nullable.
        - quality_of_language (FloatField): Numeric rating of the language quality. Nullable.
        - quality_of_classes (FloatField): Numeric rating of the class quality. Nullable.
        - quality_of_seminar (FloatField): Numeric rating of the seminar quality. Nullable.
        - quality_of_precepts (FloatField): Numeric rating of the precepts quality. Nullable.
        - quality_of_laboratories (FloatField): Numeric rating of the laboratory quality. Nullable.
        - quality_of_studios (FloatField): Numeric rating of the studio quality. Nullable.
        - quality_of_ear_training (FloatField): Numeric rating of the ear training quality. Nullable.
        - overall_quality_of_the_course (FloatField): Overall numeric rating of the course quality. Nullable.
        - interest_in_subject_matter (FloatField): Numeric rating of interest in subject matter. Nullable.
        - overall_quality_of_the_lecture (FloatField): Overall numeric rating of the lecture quality. Nullable.
        - papers_and_problem_sets (FloatField): Numeric rating of the quality of papers and problem sets. Nullable.
        - readings (FloatField): Numeric rating of the readings quality. Nullable.
        - oral_presentation_skills (FloatField): Numeric rating of the oral presentation skills. Nullable.
        - workshop_structure (FloatField): Numeric rating of the workshop structure quality. Nullable.
        - written_work (FloatField): Numeric rating of the written work quality. Nullable.

    Meta:
        - db_table: Custom 'CourseEvaluations' name for readability.

    Methods:
        - __str__: Returns a string representation of the CourseEvaluations instance.
    """

    course_guid = models.CharField(max_length=15, db_index=True, null=True)
    quality_of_course = models.FloatField(null=True)
    quality_of_lectures = models.FloatField(null=True)
    quality_of_readings = models.FloatField(null=True)
    quality_of_written_assignments = models.FloatField(null=True)
    recommend_to_other_students = models.FloatField(null=True)
    quality_of_language = models.FloatField(null=True)
    quality_of_classes = models.FloatField(null=True)
    quality_of_the_classes = models.FloatField(null=True)
    quality_of_seminar = models.FloatField(null=True)
    quality_of_precepts = models.FloatField(null=True)
    quality_of_laboratories = models.FloatField(null=True)
    quality_of_studios = models.FloatField(null=True)
    quality_of_ear_training = models.FloatField(null=True)
    overall_course_quality_rating = models.FloatField(null=True)
    overall_quality_of_the_course = models.FloatField(null=True)
    interest_in_subject_matter = models.FloatField(null=True)
    overall_quality_of_the_lecture = models.FloatField(null=True)
    papers_and_problem_sets = models.FloatField(null=True)
    readings = models.FloatField(null=True)
    oral_presentation_skills = models.FloatField(null=True)
    workshop_structure = models.FloatField(null=True)
    written_work = models.FloatField(null=True)

    class Meta:
        db_table = 'CourseEvaluations'

    def __str__(self):
        return f'Evaluation for {self.course.name} - {self.term.name}'


class CourseComments(models.Model):
    """
    A collection of student comments from the Princeton Course Evaluation portal.

    Attributes:
        course_evaluation (ForeignKey): The corresponding CourseEvaluation of the comment.
        comment (TextField): The contents of the comment.

    Meta:
        db_table: Custom 'CourseComments' name for readability.

    Methods:
        __str__: Returns a string representation of the CourseComments instance.
    """

    course_guid = models.CharField(max_length=15, db_index=True, null=True)
    comment = models.TextField(null=True)

    class Meta:
        db_table = 'CourseComments'

    def __str__(self):
        return (
            f'{self.comment}'
        )


# ----------------------------------------------------------------------#