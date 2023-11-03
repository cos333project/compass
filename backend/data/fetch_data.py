import argparse
import csv
from req_lib import ReqLib

#--------------------------------------------------------------------------------------

def fetch_data(subject, term):
    term_info = req_lib.getJSON(req_lib.configs.COURSES_COURSES, fmt="json", term=term, subject=subject)
    course_ids = [course.get("course_id", "") for subject_data in term_info.get("term", []) for course in subject_data.get("courses", [])]
    print(f"course:ids: {course_ids}")
    seat_info = req_lib.getJSON(req_lib.configs.COURSES_RESSEATS, fmt="json", term=term, course_ids=','.join(course_ids))
    
    course_details = {
        course_id: req_lib.getJSON(
            req_lib.configs.COURSES_DETAILS, 
            fmt="json", 
            term=term, 
            course_id=course_id
            ) 
        for course_id in course_ids
    }
    print(f"seat_info: {seat_info}")
    return term_info, seat_info, course_details

#--------------------------------------------------------------------------------------

def process_courses(term_info, seat_info, class_details, writer):
    seat_mapping = {seat['course_id']: seat for seat in seat_info.get('courses', [])}
    detail_mapping = {detail['course_id']: detail for detail in class_details.get('course_details', [])}
    
    for term in term_info.get("term", []):
        for subject in term.get("subjects", []):
            for course in subject.get("courses", []):
                course_detail = detail_mapping.get(course.get("course_id", ""), {})
                process_course(term, subject, course, seat_mapping, course_detail, writer)

#--------------------------------------------------------------------------------------

def process_course(term, subject, course, seat_mapping, course_details, writer):
    common_data = extract_common_data(term, subject, course)
    
    course_details_data = extract_course_details(course_details)
    
    for instructor in course.get("instructors", []):
        instructor_data = extract_instructor_data(instructor)
        crosslisting_data = extract_crosslisting_data(course.get("crosslistings", []))
        
        for course_class in course.get("classes", []):
            class_data = extract_class_data(course_class, seat_mapping)
            
            for meeting in course_class.get("schedule", {}).get("meetings", []):
                meeting_data = extract_meeting_data(meeting)
                
                row_data = {**common_data, **instructor_data, **crosslisting_data, **class_data, **meeting_data, **course_details_data}
                writer.writerow(row_data)

#--------------------------------------------------------------------------------------

def extract_common_data(term, subject, course):
    return {
        'Term Code': term.get("code", ""),
        'Term Name': term.get("suffix", ""),
        'Term Start Date': term.get("start_date", ""),
        'Term End Date': term.get("end_date", ""),
        'Subject Code': subject.get("code", ""),
        'Subject Name': subject.get("name", ""),
        'Course ID': course.get("course_id", ""),
        'Course GUID': course.get("guid", ""),
        'Catalog Number': course.get("catalog_number", ""),
        'Course Title': course.get("title", ""),
        'Course Start Date': course.get("detail", {}).get("start_date", ""),
        'Course End Date': course.get("detail", {}).get("end_date", ""),
        'Course Track': course.get("detail", {}).get("track", ""),
        'Course Description': course.get("detail", {}).get("description", "").replace("\n", ""),
        'Seat Reservations': course.get("detail", {}).get("seat_reservations", "")
    }

#--------------------------------------------------------------------------------------

def extract_instructor_data(instructor):
    return {
        'Instructor EmplID': instructor.get("emplid", ""),
        'Instructor First Name': instructor.get("first_name", ""),
        'Instructor Last Name': instructor.get("last_name", ""),
        'Instructor Full Name': instructor.get("full_name", "")
    }

#--------------------------------------------------------------------------------------

def extract_crosslisting_data(crosslistings):
    crosslisting_subjects = [crosslisting.get("subject", "") for crosslisting in crosslistings]
    crosslisting_catalog_numbers = [crosslisting.get("catalog_number", "") for crosslisting in crosslistings]
    return {
        'Crosslisting Subjects': ','.join(crosslisting_subjects),
        'Crosslisting Catalog Numbers': ','.join(crosslisting_catalog_numbers)
    }

#--------------------------------------------------------------------------------------

def extract_class_data(course_class, seat_mapping):
    course_id = course_class.get("course_id", "")
    if course_id in seat_mapping:
        specific_seat_info = seat_mapping[course_id]
        class_year_enrollments = specific_seat_info.get("classes", [])[0].get("class_year_enrollments", [])
        class_year_enrollments_str = ', '.join([f"Year {enroll.get('class_year', '')}: {enroll.get('enrl_seats', '')} students" for enroll in class_year_enrollments])
    else:
        class_year_enrollments_str = "N/A"
    return {
        'Class Number': course_class.get("class_number", ""),
        'Class Section': course_class.get("section", ""),
        'Class Status': course_class.get("status", ""),
        'Class Type': course_class.get("type_name", ""),
        'Class Capacity': course_class.get("capacity", ""),
        'Class Enrollment': course_class.get("enrollment", ""),
        'Class Year Enrollments': class_year_enrollments_str
    }

#--------------------------------------------------------------------------------------

def extract_course_details(course_detail):
    data = {
        'Drop Consent': course_detail.get("drop_consent", ""),
        'Grading Oral Presentation': course_detail.get("grading_oral_pres", ""),
        'Other Information': course_detail.get("other_information", ""),
        'Subject': course_detail.get("subject", ""),
        'Catnum': course_detail.get("catnum", ""),
        'Reading Writing Assignment': course_detail.get("reading_writing_assignment", ""),
        'Grading Quizzes': course_detail.get("grading_quizzes", ""),
        'Distribution Area Long': course_detail.get("distribution_area_long", ""),
        'Grading Home Mid Exam': course_detail.get("grading_home_mid_exam", ""),
        'Transcript Title': course_detail.get("transcript_title", ""),
        'Add Consent': course_detail.get("add_consent", ""),
        'Web Address': course_detail.get("web_address", ""),
        'PU Flag': course_detail.get("pu_flag", ""),
        'Grading Other Exam': course_detail.get("grading_other_exam", ""),
        'Topic Title': course_detail.get("topic_title", ""),
        'Grading Lab Reports': course_detail.get("grading_lab_reports", ""),
        'Other Requirements': course_detail.get("other_requirements", ""),
        'Course Head NetID': course_detail.get("course_head_netid", ""),
        'Grading Paper Final Exam': course_detail.get("grading_paper_final_exam", ""),
        'Crosslistings': course_detail.get("crosslistings", ""),
        'Grading Papers': course_detail.get("grading_papers", ""),
        'Description': course_detail.get("description", ""),
        'Grading Mid Exam': course_detail.get("grading_mid_exam", ""),
        'Grading Prog Assign': course_detail.get("grading_prog_assign", ""),
        'Grading Basis': course_detail.get("grading_basis", ""),
        'Grading Final Exam': course_detail.get("grading_final_exam", ""),
        'Grading Design Projects': course_detail.get("grading_design_projects", ""),
        'Grading Other': course_detail.get("grading_other", ""),
        'Long Title': course_detail.get("long_title", ""),
        'Grading Home Final Exam': course_detail.get("grading_home_final_exam", ""),
        'Grading Prob Sets': course_detail.get("grading_prob_sets", ""),
        'Distribution Area Short': course_detail.get("distribution_area_short", ""),
        'Grading Precept Part': course_detail.get("grading_precept_part", ""),
        'Grading Term Papers': course_detail.get("grading_term_papers", ""),
    }
    
    # Handle potential variability in reading list titles
    idx = 1
    while True:
        key = f"reading_list_title_{idx}"
        if key in course_detail:
            data[key] = course_detail.get(key, "")
            idx += 1
        else:
            break
    
    return data

#--------------------------------------------------------------------------------------

def extract_meeting_data(meeting):
    days = ",".join(meeting.get("days", []))
    return {
        'Meeting Number': meeting.get("meeting_number", ""),
        'Meeting Start Time': meeting.get("start_time", ""),
        'Meeting End Time': meeting.get("end_time", ""),
        'Meeting Days': days,
        'Building Name': meeting.get("building", {}).get("name", ""),
        'Meeting Room': meeting.get("room", "")
    }

#--------------------------------------------------------------------------------------

def get_semesters_from_args():
    parser = argparse.ArgumentParser(description="Generate CSVs for specified semesters.")
    parser.add_argument('semesters', nargs='*', help='Semesters to generate CSVs for, e.g. f2019 s2022.')
    args = parser.parse_args()
    
    if not args.semesters:
        print("No semesters provided as arguments. Please enter the semesters separated by spaces:")
        args.semesters = input().split()

    return args.semesters

#--------------------------------------------------------------------------------------

def generate_csv(semester, subjects, query, fieldnames):
    csv_file = f"{semester}.csv"
    with open(csv_file, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for subj in subjects:
            term_info, seat_info, course_details = fetch_data(subj, int(query[semester]))
            process_courses(term_info, seat_info, course_details, writer)

#--------------------------------------------------------------------------------------

def main():
    global req_lib
    req_lib = ReqLib()
    
    query = {
        "f2023": "1242",
        "f2022": "1232",
        "f2021": "1222",
        "f2020": "1212",
        "f2019": "1202",

        "s2023": "1234",
        "s2022": "1224",
        "s2021": "1214",
        "s2020": "1204",
        "s2019": "1194",
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

    term_fields = [
    'Term Code', 'Term Name', 'Term Start Date', 'Term End Date'
    ]

    subject_fields = [
        'Subject Code', 'Subject Name'
    ]

    course_fields = [
        'Course ID', 'Course GUID', 'Catalog Number', 'Course Title', 'Course Start Date',
        'Course End Date', 'Course Track', 'Course Description', 'Seat Reservations'
    ]

    instructor_fields = [
        'Instructor EmplID', 'Instructor First Name', 'Instructor Last Name', 'Instructor Full Name'
    ]

    crosslisting_fields = [
        'Crosslisting Subjects', 'Crosslisting Catalog Numbers'
    ]

    class_fields = [
        'Class Number', 'Class Section', 'Class Status', 'Class Type',
        'Class Capacity', 'Class Enrollment', 'Class Year Enrollments'
    ]

    meeting_fields = [
        'Meeting Number', 'Meeting Start Time', 'Meeting End Time', 'Meeting Days',
        'Building Name', 'Meeting Room'
    ]

    course_details_fields = [
        'Drop Consent', 'Grading Oral Presentation', 'Other Information', 
        'Subject', 'Catnum', 'Reading Writing Assignment', 'Grading Quizzes', 
        'Distribution Area Long', 'Grading Home Mid Exam', 'Transcript Title', 
        'Add Consent', 'Web Address', 'PU Flag', 'Grading Other Exam', 
        'Topic Title', 'Grading Lab Reports', 'Other Requirements', 
        'Course Head NetID', 'Grading Paper Final Exam', 'Crosslistings', 
        'Grading Papers', 'Description', 'Grading Mid Exam', 
        'Grading Prog Assign', 'Grading Basis', 'Grading Final Exam', 
        'Grading Design Projects', 'Grading Other', 'Long Title', 
        'Grading Home Final Exam', 'Grading Prob Sets', 'Distribution Area Short', 
        'Grading Precept Part', 'Grading Term Papers'
    ]

    reading_list_fields = [
        f'reading_list_title_{i}' for i in range(1, 11)
    ] + [
        f'reading_list_author_{i}' for i in range(1, 11)
    ]

    fields = [
        term_fields, 
        subject_fields, 
        course_fields, 
        instructor_fields, 
        crosslisting_fields, 
        class_fields, 
        meeting_fields, 
        course_details_fields,
        reading_list_fields
    ]

    fieldnames = sum(fields, [])

    available_semesters = query.keys()
    semesters = get_semesters_from_args()

    for semester in semesters:
        if semester in available_semesters:
            generate_csv(semester, subjects, query, fieldnames)
        else:
            print(f"Warning: Semester '{semester}' not found in available semesters. Skipping.")

if __name__ == "__main__":
    main()
