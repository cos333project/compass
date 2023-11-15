from req_lib import ReqLib

req_lib = ReqLib()


resseats = req_lib.getJSON(
    req_lib.configs.COURSES_RESSEATS, term='1224', course_ids=('004412'), fmt='json'
)
print(resseats)
