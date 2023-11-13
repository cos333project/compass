from req_lib import ReqLib
req_lib = ReqLib()

course_ids = ['010069', '015230']
course_ids = ','.join(course_ids)
resseats = req_lib.getJSON(
        req_lib.configs.COURSES_RESSEATS, 
        term="1232",
        course_ids=('010069','015230'),
        fmt='json'
    )
print(resseats)
