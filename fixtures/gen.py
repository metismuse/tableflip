#!/usr/bin/env python3
"""Generate TableFlip fixture CSVs with provenance. Deterministic (seeded)."""
import csv, random, os

random.seed(20261019)
HERE = os.path.dirname(os.path.abspath(__file__))

def write(name, headers, rows):
    p = os.path.join(HERE, name)
    with open(p, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(headers)
        w.writerows(rows)
    print("wrote", p, len(rows), "rows")

# 1. shipments-ugly.csv — messy logistics export (12k rows)
statuses = ["ontime", "delayed", "lost", "returned"]
regions = ["Midwest", "South ", "Northeast", " West", "Southwest"]
rows = []
for i in range(12000):
    m = random.randint(1, 9); d = random.randint(1, 28)
    fmt = random.choice(["%d-%02d-%02d" % (2026, m, d), "%02d/%02d/2026" % (m, d), "%02d-%s-26" % (d, "Jan Feb Mar Apr May Jun Jul Aug Sep".split()[m-1])])
    cost = random.choice(["$%s" % f"{random.uniform(20, 9000):,.2f}", "%s" % f"{random.uniform(20, 9000):,.2f}", "N/A" if random.random() < 0.02 else "$%s" % f"{random.uniform(20, 9000):,.2f}"])
    rows.append([fmt, cost, random.choice(statuses), random.choice(regions), random.randint(1, 400)])
write("shipments-ugly.csv", ["ShipDt", "cost_usd ", "STATUS!!", " Region", "qty"], rows)

# 2. sales-messy.csv — semicolon-delimited, European decimals, BOM
with open(os.path.join(HERE, "sales-messy.csv"), "w", newline="", encoding="utf-8-sig") as f:
    f.write("Datum;Betrag;Kategorie\n")
    for i in range(3000):
        f.write("2026-%02d-%02d;%s;%s\n" % (random.randint(1, 9), random.randint(1, 28),
            ("%s,%02d" % (random.randint(10, 5000), random.randint(0, 99))).replace(".", "."),
            random.choice(["Bücher", "Elektronik", "Kleidung"])))
print("wrote sales-messy.csv (semicolon, BOM)")

# 3. support-tickets.csv — embedded newlines + quoted commas
rows = []
prios = ["low", "medium", "high", "urgent"]
for i in range(1500):
    note = random.choice([
        "Customer called,\nasked for refund", 'Said "it broke\nafter update", escalated',
        "Simple password reset", "Follow-up\nscheduled, no answer"])
    rows.append(["T-%05d" % i, random.choice(prios), note, "2026-%02d-%02d" % (random.randint(1, 9), random.randint(1, 28))])
write("support-tickets.csv", ["ticket_id", "priority", "notes", "opened"], rows)

# 4. xss-payload.csv — adversarial cells (must render inert)
write("xss-payload.csv", ["name", "amount"],
      [["<script>alert(1)</script>", "$5"],
       ['<img src=x onerror=alert(2)>', "10"],
       ['"><svg onload=alert(3)>', "7"],
       ["normal cell", "$12.50"]])
print("done. provenance: script-generated with seed 20261019 (fixtures/gen.py)")
