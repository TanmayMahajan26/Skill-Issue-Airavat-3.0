import requests
base = "http://localhost:8000/api/v1"

r = requests.get(f"{base}/surety/gap-report")
data = r.json()
total = data["total"]
print(f"Surety gap cases: {total}")

if data["cases"]:
    cid = data["cases"][0]["case_id"]
    print(f"Test case: {cid}")
    
    r2 = requests.get(f"{base}/drafts/pr-bond/{cid}")
    print(f"PR Bond: {r2.status_code} | {len(r2.text)} chars")
    
    r3 = requests.get(f"{base}/drafts/s440/{cid}")
    print(f"S.440: {r3.status_code} | {len(r3.text)} chars")

print("DONE")
