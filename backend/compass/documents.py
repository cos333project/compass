# documents.py
from django_elasticsearch_dsl import Document
from django_elasticsearch_dsl.registries import registry
from .models import Course  # Import your model


@registry.register_document
class CourseDocument(Document):
    class Index:
        name = 'courses'
        settings = {'number_of_shards': 1, 'number_of_replicas': 0}

    class Django:
        model = Course  # The model associated with this Document

        # The fields of the model you want to be indexed in Elasticsearch
        fields = [
            'department_code',
            'catalog_number',
            'title',
        ]

    # You can also add custom fields
    # custom_field = fields.TextField()
