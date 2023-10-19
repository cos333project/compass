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

    with open('f2023_courses_courses.csv', 'w', newline='') as csvfile:
        fieldnames = [
            'Term Code', 'Term Name', 'Term Start Date', 'Term End Date',
            'Subject Code', 'Subject Name',
            'Course GUID', 'Course ID', 'Catalog Number', 'Course Title', 'Course Start Date', 'Course End Date', 'Course Track', 'Course Description', 'Seat Reservations',
            'Instructor EmplID', 'Instructor First Name', 'Instructor Last Name', 'Instructor Full Name',
            'Crosslisting Subject', 'Crosslisting Catalog Number',
            'Class Number', 'Class Section', 'Class Status', 'Class Type', 'Class Capacity', 'Class Enrollment',
            'Meeting Start Date', 'Meeting End Date', 'Meeting Number', 'Meeting Start Time', 'Meeting End Time', 'Meeting Days', 'Building Name', 'Meeting Room'
        ]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for subj in subjects:
            term_info = req_lib.getJSON(req_lib.configs.COURSES_COURSES, fmt="json", term=int(semester["f2023"]), subject=subj)

            for term in term_info.get("term", []):
                term_code = term.get("code", "")
                term_suffix = term.get("suffix", "")
                term_start_date = term.get("start_date", "")
                term_end_date = term.get("end_date", "")

                for subject_data in term.get("subjects", []):
                    subj_code = subject_data.get("code", "")
                    subj_name = subject_data.get("name", "")
                    
                    for course in subject_data.get("courses", []):
                        course_guid = course.get("guid", "")
                        course_id = course.get("course_id", "")
                        catalog_number = course.get("catalog_number", "")
                        course_title = course.get("title", "")
                        course_detail = course.get("detail", {})
                        course_start_date = course_detail.get("start_date", "")
                        course_end_date = course_detail.get("end_date", "")
                        course_track = course_detail.get("track", "")
                        description = course_detail.get("description", "")
                        seat_reservations = course_detail.get("seat_reservations", "")
                        
                        for instructor in course.get("instructors", []):
                            emplid = instructor.get("emplid", "")
                            first_name = instructor.get("first_name", "")
                            last_name = instructor.get("last_name", "")
                            full_name = instructor.get("full_name", "")

                            for crosslisting in course.get("crosslistings", []):
                                crosslisting_subject = crosslisting.get("subject", "")
                                crosslisting_catalog_number = crosslisting.get("catalog_number", "")
                            
                                for course_class in course.get("classes", []):
                                    class_number = course_class.get("class_number", "")
                                    section = course_class.get("section", "")
                                    status = course_class.get("status", "")
                                    type_name = course_class.get("type_name", "")
                                    capacity = course_class.get("capacity", "")
                                    enrollment = course_class.get("enrollment", "")
                                    
                                    for meeting in course_class.get("schedule", {}).get("meetings", []):
                                        meeting_start_date = meeting.get("start_date", "")
                                        meeting_end_date = meeting.get("end_date", "")
                                        meeting_number = meeting.get("meeting_number", "")
                                        start_time = meeting.get("start_time", "")
                                        end_time = meeting.get("end_time", "")
                                        room = meeting.get("room", "")
                                        days = ",".join(meeting.get("days", []))
                                        building_name = meeting.get("building", {}).get("name", "")

                                        writer.writerow({
                                            'Term Code' : term_code, 'Term Name' : term_suffix, 
                                            'Term Start Date' : term_start_date, 'Term End Date' : term_end_date,
                                            'Subject Code' : subj_code, 'Subject Name' : subj_name,
                                            'Course GUID' : course_guid, 'Course ID' : course_id, 
                                            'Catalog Number' : catalog_number, 'Course Title' : course_title, 
                                            'Course Start Date' : course_start_date, 'Course End Date' : course_end_date, 
                                            'Course Track' : course_track, 'Course Description' : description, 
                                            'Seat Reservations' : seat_reservations,
                                            'Instructor EmplID' : emplid, 'Instructor First Name' : first_name, 
                                            'Instructor Last Name' : last_name, 'Instructor Full Name' : full_name,
                                            'Crosslisting Subject' : crosslisting_subject, 'Crosslisting Catalog Number' : crosslisting_catalog_number,
                                            'Class Number' : class_number, 'Class Section' : section, 
                                            'Class Status' : status, 'Class Type' : type_name, 
                                            'Class Capacity' : capacity, 'Class Enrollment' : enrollment,
                                            'Meeting Start Date' : meeting_start_date, 'Meeting End Date' : meeting_end_date, 
                                            'Meeting Number' : meeting_number, 'Meeting Start Time' : start_time, 
                                            'Meeting End Time' : end_time, 'Meeting Days' : days, 
                                            'Building Name' : building_name, 'Meeting Room' : room
                                        })
                                        