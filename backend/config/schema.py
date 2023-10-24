import graphene
import compass.schema

# The project-level schema.py where we stitch together the app-level schemas.

class Query(compass.schema.Query, graphene.ObjectType):
    """
    This class inherits queries defined in app-level schemas (Compass).
    """
    pass

# Global schema object that allows GraphQL to execute queries.
schema = graphene.Schema(query=Query)
