from django.db import transaction
import yaml
from typing import Optional
from models import Requirement  # Replace with your actual Requirement model import

@transaction.atomic
def insert_requirements(yaml_file_path: str, parent_id: Optional[int] = None):
    # Read the YAML file to get all requirement data
    with open(yaml_file_path, 'r') as f:
        all_requirements = yaml.safe_load(f)
    
    # Loop through each requirement dictionary and insert it into the database
    try:
        for requirement_data in all_requirements['req_list']:  # Assuming 'req_list' contains the list of requirements
            req = Requirement.objects.create(
                name=requirement_data.get("name"),
                max_counted=requirement_data.get("max_counted"),
                min_needed=requirement_data.get("min_needed", "ALL"),
                explanation=requirement_data.get("explanation"),
                double_counting_allowed=requirement_data.get("double_counting_allowed", False),
                max_common_with_major=requirement_data.get("max_common_with_major"),
                pdfs_allowed=requirement_data.get("pdfs_allowed", False),
                min_grade=requirement_data.get("min_grade"),
                completed_by_semester=requirement_data.get("completed_by_semester"),
                dist_req=requirement_data.get("dist_req", False),
                num_courses=requirement_data.get("num_courses"),
                parent_id=parent_id
            )
            
            # Recursive call to handle sub-requirements
            if "req_list" in requirement_data:
                for sub_req_data in requirement_data["req_list"]:
                    insert_requirements(sub_req_data, req.id)

        print("Transaction successful: Requirements inserted.")
    except Exception as e:
        print(f"Transaction failed: {e}")
