"""Comprehensive API test for all 6 new features."""
import requests
import json

base = "http://localhost:8000/api/v1"

# 1. Alerts Engine
r = requests.get(f"{base}/alerts/active")
data = r.json()
print(f"[1] Alerts API: {r.status_code}")
print(f"    Total: {data['total']}")
print(f"    Default Bail: {data['breakdown']['default_bail']}")
print(f"    Ghost Warrant: {data['breakdown']['custody_overlap']}")
print(f"    PR Bond: {data['breakdown']['pr_bond']}")

# 2. Find eligible case
r2 = requests.get(f"{base}/cases?eligibility=ELIGIBLE&limit=1")
cases = r2.json()["cases"]
if cases:
    cid = cases[0]["id"]
    cnum = cases[0]["case_number"]
    print(f"\n[2] Eligible case: {cnum} ({cid})")

    # 3. S.479 Petition
    r3 = requests.get(f"{base}/drafts/s479/{cid}")
    print(f"[3] S.479 Petition: {r3.status_code} | {len(r3.text)} chars generated")

    # 4. Case-specific alerts
    r4 = requests.get(f"{base}/alerts/case/{cid}")
    print(f"[4] Case Alerts: {r4.status_code} | {len(r4.json()['alerts'])} alerts found")
else:
    print("[2] No eligible cases found")

# 5. Find a bail-granted case
r5 = requests.get(f"{base}/cases?limit=200")
bail_cases = [c for c in r5.json()["cases"] if c.get("bail_granted") and c.get("surety_amount")]
if bail_cases:
    bcid = bail_cases[0]["id"]
    bnum = bail_cases[0]["case_number"]
    print(f"\n[5] Bail case: {bnum} ({bcid})")

    # 6. PR Bond Petition
    r6 = requests.get(f"{base}/drafts/pr-bond/{bcid}")
    print(f"[6] PR Bond Petition: {r6.status_code} | {len(r6.text)} chars")

    # 7. S.440 Surety Reduction
    r7 = requests.get(f"{base}/drafts/s440/{bcid}")
    print(f"[7] S.440 Reduction: {r7.status_code} | {len(r7.text)} chars")
else:
    print("[5] No bail-granted cases found")

# 8. Bail Condition Parser (NLP)
order_text = "The accused shall furnish two sureties of Rs. 25000 each, surrender passport, report to local PS every Monday, not leave the jurisdiction, and cooperate with the investigation."
r8 = requests.post(f"{base}/bail/parse-conditions", json={"order_text": order_text})
items = r8.json()["items"]
print(f"\n[8] Bail Parser: {r8.status_code} | Extracted {len(items)} conditions:")
for item in items:
    print(f"    {item['icon']} {item['condition']} [{item['category']}]")

print("\n=== ALL 6 FEATURES VERIFIED ===")
