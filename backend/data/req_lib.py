from typing import Dict, Any
from .configs import Configs
import requests


class ReqLib:
    def __init__(self):
        self.configs = Configs()

    def _make_request(self, endpoint: str, **kwargs: Any) -> requests.Response:
        base_url = self.configs.get_base_url(endpoint)
        url = f'{base_url}{endpoint}'
        print(url)
        headers = {
            'Authorization': f'Bearer {self.configs.ACCESS_TOKEN}',
            'Accept': 'application/json',
        }
        req = requests.get(url, params=kwargs, headers=headers)

        if req.status_code != 200:
            self.configs._refreshToken(grant_type='client_credentials')
            req = requests.get(url, params=kwargs, headers=headers)

        return req

    def getJSON(self, endpoint: str, **kwargs: Any) -> Dict:
        req = self._make_request(endpoint, **kwargs)
        return req.json()
