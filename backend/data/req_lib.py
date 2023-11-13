from typing import Dict, Any
from configs import Configs

# Future devs: Try implementing asyncio and aiohttp to make asynchronous I/O requests
# import requests
import asyncio
import aiohttp
import json
import logging
logging.basicConfig(level=logging.DEBUG)
class ReqLib:

    def __init__(self, session: aiohttp.ClientSession, configs: Configs):
        self.session = session
        self.configs = configs

    async def _make_request(self, endpoint: str, **kwargs: Any) -> aiohttp.ClientResponse:
        url = f"{self.configs.BASE_URL}{endpoint}"
        headers = {
            "Authorization": f"Bearer {self.configs.ACCESS_TOKEN}",
            "Accept": "application/json"
        }
        logging.debug(f"Making request to URL: {url} with headers: {headers} and params: {kwargs}")
        try:
            async with self.session.get(f"{self.configs.BASE_URL}{endpoint}", params=kwargs, headers=headers) as response:
                logging.debug(f"Received response with status: {response.status}, Content-Length: {response.headers.get('Content-Length')}")
                if response.status != 200:
                    headers["Authorization"] = f"Bearer {self.configs.ACCESS_TOKEN}"
                    response = await self.session.get(f"{self.configs.BASE_URL}{endpoint}", params=kwargs, headers=headers, timeout=10)
                return response
        except aiohttp.ClientConnectionError as e:
            raise RuntimeError(f"Connection error occurred: {e}")
        except Exception as e:
            logging.error(f"Error making request: {e}")
            raise RuntimeError(f"An error occurred: {e}")

    async def getJSON(self, url: str, **kwargs: Any) -> Dict:
        try:
            response = await self._make_request(url, **kwargs)
            return await response.json()
        except json.decoder.JSONDecodeError:
            raise ValueError("Received malformed JSON or empty response from server")
