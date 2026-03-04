import os
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.environ.get("FIGMA_TOKEN")

FILE_ID = "ESICqiCEFwLOHIVFlAPg6u"

def figma_request(endpoint):
    url = f"https://api.figma.com/v1/{endpoint}"
    req = urllib.request.Request(url, headers={"X-Figma-Token": TOKEN})
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"Error fetching {endpoint}: {e}")
        return None

def main():
    print(f"Fetching specific file: {FILE_ID}...")
    
    # Detaylı ağacı çekelim (sadece 1 dosya olduğu için hızlıca iner)
    doc_data = figma_request(f"files/{FILE_ID}?plugin_data=shared")
    
    if not doc_data:
        print("Could not fetch file.")
        return
        
    os.makedirs("data_dump", exist_ok=True)
    with open("data_dump/fk_wallet_page.json", "w") as f:
        json.dump(doc_data, f, indent=2)
        
    print("Done! Data saved to data_dump/fk_wallet_page.json")
    
    # Sayfaları özetleyelim
    for page in doc_data.get("document", {}).get("children", []):
        print(f"Page: {page['name']}")

if __name__ == "__main__":
    main()
