import csv
from req_lib import ReqLib

if __name__ == "__main__":
    req_lib = ReqLib()
    semester = {
        "f2023": "1242",
        "f2022": "1232",
        "f2021": "1222",
        "f2020": "1212",
        # "spring_2023": "N/A",
        "s2022": "1234",
        "s2021": "1224",
        "s2020": "1214",
        # Clear pattern so we could try to pull data further back as well
    }
    
    subjects = [
        "AAS", "AFS", "AMS", "ANT", "AOS", "APC", "ARA", "ARC", "ART", "ASA",
        "ASL", "AST", "ATL", "BCS", "BNG", "CBE", "CDH", "CEE", "CGS", "CHI",
        "CHM", "CHV", "CLA", "COM", "COS", "CWR", "CZE", "DAN", "EAS", "ECE",
        "ECO", "ECS", "EEB", "EGR", "ENE", "ENG", "ENT", "ENV", "EPS", "FIN",
        "FRE", "FRS", "GEO", "GER", "GEZ", "GHP", "GSS", "HEB", "HIN", "HIS",
        "HLS", "HOS", "HUM", "ISC", "ITA", "JDS", "JPN", "JRN", "KOR", "LAO",
        "LAS", "LAT", "LCA", "LIN", "MAE", "MAT", "MED", "MOD", "MOG", "MOL",
        "MPP", "MSE", "MTD", "MUS", "NES", "NEU", "ORF", "PAW", "PER", "PHI",
        "PHY", "PLS", "POL", "POP", "POR", "PSY", "QCB", "REL", "RES", "RUS",
        "SAN", "SLA", "SML", "SOC", "SPA", "SPI", "STC", "SWA", "THR", "TPP",
        "TRA", "TUR", "TWI", "UKR", "URB", "URD", "VIS", "WRI"
    ]

    # Initialize a list to hold course IDs
    course_ids = []

    # Fetch course IDs from COURSES_COURSES endpoint
    for subj in subjects:
        term_info = req_lib.getJSON(req_lib.configs.COURSES_COURSES, fmt="json", term=int(semester["f2023"]), subject=subj)
        for term in term_info.get("term", []):
            for subject_data in term.get("subjects", []):
                for course in subject_data.get("courses", []):
                    course_id = course.get("course_id", "")
                    if course_id:
                        course_ids.append(course_id)

    # Now use these course IDs in COURSES_RESSEATS endpoint
    course_ids_str = ','.join(course_ids)

    with open('f2023_courses_resseats.csv', 'w', newline='') as csvfile:
        fieldnames = ['Course ID', 'Class Number', 'Class Section', 'Class Year Enrollments']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        seat_info = req_lib.getJSON(
            req_lib.configs.COURSES_RESSEATS,
            fmt="json",
            term=int(semester["f2023"]),
            course_ids=course_ids_str
        )
        
        for course in seat_info.get("courses", []):
            course_id = course.get("course_id", "")
            for course_class in course.get("classes", []):
                class_number = course_class.get("class_number", "")
                section = course_class.get("section", "")
                class_year_enrollments = course_class.get("class_year_enrollments", [])
                class_year_enrollments_str = ','.join([f"{enroll.get('class_year', '')}|{enroll.get('enrl_seats', '')}" for enroll in class_year_enrollments])
                
                writer.writerow({
                    'Course ID': course_id,
                    'Class Number': class_number,
                    'Class Section': section,
                    'Class Year Enrollments': class_year_enrollments_str
                })