from typing import Dict, Any
from configs import Configs
import requests

class ReqLib:

    def __init__(self):
        self.configs = Configs()

    def _make_request(self, endpoint: str, **kwargs: Any) -> requests.Response:
        req = requests.get(
            f"{self.configs.BASE_URL}{endpoint}", 
            params=kwargs, 
            headers={"Authorization": f"Bearer {self.configs.ACCESS_TOKEN}"}
        )
        
        if req.status_code != 200:
            self.configs._refreshToken(grant_type="client_credentials")
            req = requests.get(
                f"{self.configs.BASE_URL}{endpoint}", 
                params=kwargs, 
                headers={"Authorization": f"Bearer {self.configs.ACCESS_TOKEN}"}
            )

        return req

    def getJSON(self, endpoint: str, **kwargs: Any) -> Dict:
        req = self._make_request(endpoint, **kwargs)
        return req.json()

    def getXMLorTXT(self, endpoint: str, **kwargs: Any) -> str:
        req = self._make_request(endpoint, **kwargs)
        return req.text
