import requests

print("--- FMP API Test ---")
api_key = input("Paste your FMP API Key to test: ").strip()

def test_endpoint(name, url):
    print(f"\nTesting {name}...")
    try:
        resp = requests.get(url)
        print(f"Status Code: {resp.status_code}")
        try:
            data = resp.json()
            if isinstance(data, dict) and "Error Message" in data:
                print(f"❌ FMP Error: {data['Error Message']}")
            else:
                print(f"✅ Success! Data sample: {str(data)[:200]}...")
        except ValueError:
            print(f"❌ Failed to parse JSON. Response: {resp.text[:200]}")
    except Exception as e:
        print(f"❌ Request failed: {e}")

test_endpoint("Company Profile (APP)", f"https://financialmodelingprep.com/api/v3/profile/APP?apikey={api_key}")
test_endpoint("Earnings Calendar", f"https://financialmodelingprep.com/api/v3/earning_calendar?apikey={api_key}")
