"""Quick endpoint smoke test."""
import httpx

BASE = "http://localhost:8000"

tests = [
    ("GET", "/health"),
    ("GET", "/api/v1/cases/queue?limit=2"),
    ("GET", "/api/v1/cases?limit=2"),
    ("GET", "/api/v1/hearings/upcoming?days=7"),
    ("GET", "/api/v1/surety/gap-report"),
    ("GET", "/api/v1/analytics/charge-detention"),
    ("GET", "/api/v1/analytics/court-performance"),
    ("GET", "/api/v1/analytics/prison-heatmap"),
    ("GET", "/api/v1/analytics/accuracy-tracking"),
    ("GET", "/api/v1/admin/system-health"),
    ("GET", "/api/v1/admin/data-lifecycle"),
    ("GET", "/api/v1/admin/audit-log?limit=3"),
    ("GET", "/api/v1/fl/governance"),
    ("POST", "/api/v1/comms/glossary-lookup", {"term": "bail", "language": "hi"}),
    ("POST", "/api/v1/comms/chat-simulate", {"message": "what does bail mean", "language": "en"}),
    ("POST", "/api/v1/nlp/extract-charges", {"fir_text": "Section 379 IPC theft", "language": "en"}),
    ("POST", "/api/v1/nlp/name-match", {"name_a": "Rajesh Kumar", "name_b": "rajesh kumar"}),
]

passed = 0
failed = 0
for t in tests:
    method = t[0]
    url = t[1]
    body = t[2] if len(t) > 2 else None
    try:
        if method == "GET":
            r = httpx.get(BASE + url, timeout=30)
        else:
            r = httpx.post(BASE + url, json=body, timeout=30)
        status = r.status_code
        ok = "PASS" if status == 200 else "FAIL"
        if status != 200:
            failed += 1
            print(f"  {ok} {status} {method} {url}")
            print(f"       {r.text[:200]}")
        else:
            passed += 1
            print(f"  {ok} {status} {method} {url}")
    except Exception as e:
        failed += 1
        print(f"  ERR  {method} {url} -> {e}")

print(f"\nResults: {passed} passed, {failed} failed out of {len(tests)}")
