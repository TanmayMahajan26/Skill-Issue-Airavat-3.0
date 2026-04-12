import sqlite3
c = sqlite3.connect('justicegrid_dev.db')
c.row_factory = sqlite3.Row

print("=== DATABASE STATUS ===")
print("Total cases:", c.execute("SELECT COUNT(*) FROM cases").fetchone()[0])
print("Total users:", c.execute("SELECT COUNT(*) FROM users").fetchone()[0])

# Check petition eligibility counts
print("\n=== PETITION ELIGIBILITY ===")
print("S.479 eligible (ELIGIBLE + no bail):", c.execute("SELECT COUNT(*) FROM cases WHERE eligibility_status='ELIGIBLE' AND bail_granted=0").fetchone()[0])
print("PR Bond eligible (bail granted + surety not executed):", c.execute("SELECT COUNT(*) FROM cases WHERE bail_granted=1 AND surety_executed=0").fetchone()[0])
print("S.440 eligible (bail granted + surety > 0):", c.execute("SELECT COUNT(*) FROM cases WHERE bail_granted=1 AND surety_amount > 0").fetchone()[0])

# Check what the /api/v1/cases endpoint returns
print("\n=== SAMPLE CASE FIELDS ===")
row = c.execute("SELECT * FROM cases LIMIT 1").fetchone()
print("Columns:", row.keys())

# Check a PR bond eligible case
pr = c.execute("SELECT id, case_number, accused_name, bail_granted, surety_executed, surety_amount, assigned_paralegal_id FROM cases WHERE bail_granted=1 AND surety_executed=0 LIMIT 3").fetchall()
print("\n=== SAMPLE PR BOND CASES ===")
for r in pr:
    print(dict(r))

# Check user assignments
print("\n=== USERS ===")
users = c.execute("SELECT id, email, name, role FROM users").fetchall()
for u in users:
    print(dict(u))

# Check how many cases are assigned to the paralegal
paralegal = c.execute("SELECT id FROM users WHERE role='paralegal'").fetchone()
if paralegal:
    pid = paralegal['id']
    print(f"\n=== PARALEGAL {pid} CASES ===")
    print("Total assigned:", c.execute("SELECT COUNT(*) FROM cases WHERE assigned_paralegal_id=?", (pid,)).fetchone()[0])
    print("PR Bond eligible assigned:", c.execute("SELECT COUNT(*) FROM cases WHERE assigned_paralegal_id=? AND bail_granted=1 AND surety_executed=0", (pid,)).fetchone()[0])
    print("S.479 eligible assigned:", c.execute("SELECT COUNT(*) FROM cases WHERE assigned_paralegal_id=? AND eligibility_status='ELIGIBLE' AND bail_granted=0", (pid,)).fetchone()[0])
