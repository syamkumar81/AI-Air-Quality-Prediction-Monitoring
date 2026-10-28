import os
import requests
import dotenv

dotenv.load_dotenv()
api_key = os.getenv("OPENAQ_API_KEY")
headers = {"X-API-Key": api_key}

res = requests.get("https://api.openaq.org/v3/locations/2586/sensors", headers=headers)
print("Status:", res.status_code)
if res.ok:
    data = res.json()
    for s in data.get("results", []):
        param = s.get("parameter", {})
        name = param.get("name", "")
        units = param.get("units", "")
        print(f"ID: {s.get('id')} | Param: {name} | Units: {units}")
