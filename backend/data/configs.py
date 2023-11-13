import os
# import requests
import aiohttp
import base64
from dotenv import load_dotenv

load_dotenv()

class Configs:
    def __init__(self, session: aiohttp.ClientSession = None):
        self.CONSUMER_KEY = os.environ.get("CONSUMER_KEY")
        self.CONSUMER_SECRET = os.environ.get("CONSUMER_SECRET")
        self.BASE_URL="https://api.princeton.edu:443/student-app"
        self.COURSES_TERMS="/courses/terms"
        self.COURSES_COURSES="/courses/courses"
        self.COURSES_SEATS ="/courses/seats"
        self.COURSES_RESSEATS ="/courses/resseats"
        self.COURSES_DETAILS="/courses/details"
        self.REFRESH_TOKEN_URL="https://api.princeton.edu:443/token"
        self.session = session or aiohttp.ClientSession()

    @classmethod
    async def create(cls):
        config = cls()
        await config._refreshToken(grant_type="client_credentials")
        return config

    async def _refreshToken(self, **kwargs):
        headers = {
            "Authorization": "Basic " + base64.b64encode(f"{self.CONSUMER_KEY}:{self.CONSUMER_SECRET}".encode("utf-8")).decode("utf-8")
        }
        async with self.session.post(self.REFRESH_TOKEN_URL, data=kwargs, headers=headers) as resp:
            response = await resp.json()
            self.ACCESS_TOKEN = response["access_token"]
        