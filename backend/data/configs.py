import os
import requests
import json
import base64
from dotenv import load_dotenv

load_dotenv()

class Configs:
    def __init__(self):
        self.CONSUMER_KEY = os.environ.get("CONSUMER_KEY")
        self.CONSUMER_SECRET = os.environ.get("CONSUMER_SECRET")
        self.BASE_URL="https://api.princeton.edu:443/student-app"
        self.COURSES_TERMS="/courses/terms"
        self.COURSES_COURSES="/courses/courses"
        self.COURSES_SEATS ="/courses/seats"
        self.COURSES_RESSEATS ="/courses/resseats"
        self.COURSES_DETAILS="/courses/details"
        self.REFRESH_TOKEN_URL="https://api.princeton.edu:443/token"
        self._refreshToken(grant_type="client_credentials")

    def _refreshToken(self, **kwargs):
        req = requests.post(
            self.REFRESH_TOKEN_URL, 
            data=kwargs, 
            headers={
                "Authorization": "Basic " + base64.b64encode(bytes(self.CONSUMER_KEY + ":" + self.CONSUMER_SECRET, "utf-8")).decode("utf-8")
            },
        )
        text = req.text
        response = json.loads(text)
        self.ACCESS_TOKEN = response["access_token"]