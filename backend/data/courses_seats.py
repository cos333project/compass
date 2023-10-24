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

    # Open CSV for writing
    with open('f2023_courses_seats.csv', 'w', newline='') as csvfile:
        fieldnames = ['Course ID', 'Class Number', 'Capacity', 'Enrollment']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for subj in subjects:
            data = req_lib.getJSON(req_lib.configs.COURSES_SEATS, fmt="json", term=int(semester["f2023"]), subject=subj)
            
            # Parse the data
            for course in data.get("course", []):
                course_id = course.get("course_id", "")
                
                for course_class in course.get("classes", []):
                    class_number = course_class.get("class_number", "")
                    capacity = course_class.get("capacity", "")
                    enrollment = course_class.get("enrollment", "")

                    writer.writerow({
                        'Course ID': course_id,
                        'Class Number': class_number,
                        'Capacity': capacity,
                        'Enrollment': enrollment
                    })
