import graphene
from graphene_django.types import DjangoObjectType
from .models import (
    Department,
    Contact,
    Degree,
    Requirement,
    Course,
    Minor,
    Certificate,
    MinorRequirement,
    CertificateRequirement,
    Major,
    MajorRequirement,
)

# Definition of our GraphQL schema for Compass


class DepartmentType(DjangoObjectType):
    """
    GraphQL type to represent the Department model.
    """

    class Meta:
        model = Department


class ContactType(DjangoObjectType):
    """
    GraphQL type to represent the Contact model.
    """

    class Meta:
        model = Contact


class DegreeType(DjangoObjectType):
    """
    GraphQL type to represent the Degree model.
    """

    class Meta:
        model = Degree


class RequirementType(DjangoObjectType):
    """
    GraphQL type to represent the Requirement model.
    """

    class Meta:
        model = Requirement


class CourseType(DjangoObjectType):
    """
    GraphQL type to represent the Course model.
    """

    class Meta:
        model = Course


class MajorType(DjangoObjectType):
    """
    GraphQL type to represent the Major model.
    """

    class Meta:
        model = Major


class MajorRequirementType(DjangoObjectType):
    """
    GraphQL type to represent the MajorRequirement model.
    """

    class Meta:
        model = MajorRequirement


class MinorType(DjangoObjectType):
    """
    GraphQL type to represent the Minor model.
    """

    class Meta:
        model = Minor


class CertificateType(DjangoObjectType):
    """
    GraphQL type to represent the Certificate model.
    """

    class Meta:
        model = Certificate


class MinorRequirementType(DjangoObjectType):
    """
    GraphQL type to represent the MinorRequirement model.
    """

    class Meta:
        model = MinorRequirement


class CertificateRequirementType(DjangoObjectType):
    """
    GraphQL type to represent the CertificateRequirement model.
    """

    class Meta:
        model = CertificateRequirement


# Extend your Query class
class Query(graphene.ObjectType):
    """
    Define the queries that can be executed by the GraphQL API.
    """

    all_minors = graphene.List(MinorType)
    all_certificates = graphene.List(CertificateType)
    fetch_all_departments = graphene.List(DepartmentType)
    fetch_all_contacts = graphene.List(ContactType)
    fetch_all_degrees = graphene.List(DegreeType)
    fetch_all_requirements = graphene.List(RequirementType)
    fetch_all_courses = graphene.List(CourseType)

    def resolve_all_minors(self, info, **kwargs):
        """
        Fetches and returns all Minor objects from the database.
        Equivalent to Minor.objects.all().
        """
        return Minor.objects.all()

    def resolve_all_certificates(self, info, **kwargs):
        """
        Fetches and returns all Certificate objects from the database.
        Equivalent to Certificate.objects.all().
        """
        return Certificate.objects.all()

    def resolve_all_departments(self, info, **kwargs):
        """
        Fetches and returns all Department objects from the database.
        Equivalent to Department.objects.all().
        """
        return Department.objects.all()

    def resolve_all_contacts(self, info, **kwargs):
        """
        Fetches and returns all Contact objects from the database.
        Equivalent to Contact.objects.all().
        """
        return Contact.objects.all()

    def resolve_all_degrees(self, info, **kwargs):
        """
        Fetches and returns all Degree objects from the database.
        Equivalent to Degree.objects.all().
        """
        return Degree.objects.all()

    def resolve_all_requirements(self, info, **kwargs):
        """
        Fetches and returns all Requirement objects from the database.
        Equivalent to Requirement.objects.all().
        """
        return Requirement.objects.all()

    def resolve_all_courses(self, info, **kwargs):
        """
        Fetches and returns all Course objects from the database.
        Equivalent to Course.objects.all().
        """
        return Course.objects.all()


schema = graphene.Schema(query=Query)
