---
doc: scope
status: approved
---

# TableFlip

Drop in an ugly CSV, get a polished dashboard. No chart authoring, no signup, no upload — it never leaves your machine.

## The Unique Kernel
Automatic column type/role inference on messy real-world CSV headers (dates in three formats, "$1,234.56", "N/A", junk whitespace, SHOUTY headers) plus zero-authoring auto-layout: the app decides what the KPIs, charts, and filters should be, and shows its confidence per column. Delete the inference and it's just another CSV viewer.

## Who It's For
Priya, an operations manager at a 40-person logistics company. Every Monday she gets a 12,000-row shipment export with headers like "ShipDt", "cost_usd ", and "STATUS!!". Today she rebuilds the same pivot tables by hand. She wants Monday's answer in 30 seconds, not 30 minutes.

## The Core Loop
Open TableFlip → drop the CSV (or try a fixture) → watch the raw grid dissolve into a dashboard → filter, read the KPIs → export a single-file HTML report to send to her boss. She comes back every Monday with a new export.

## Inspiration & Identity
The "it just figured it out" feeling of a great auto-import. Clean, confident, fast. Light theme, generous whitespace, one accent color. No config panels, no jargon — column badges read like "Date · high confidence".

## Why This Matters to the Learner
Built as the "Build With AI: Basics" hackathon entry: proof that plan-first AI building produces a real, shippable proof of concept in a day.

## What "Working" Looks Like
A single index.html opened in any browser: drop fixtures/shipments-ugly.csv → within ~2 seconds a dashboard appears with KPI cards, charts, and working filter chips; every inferred column shows a confidence badge; "Export report" downloads a standalone HTML file that opens with zero network and shows the same dashboard. The "oh, that's cool" beat: the raw CSV grid visibly dissolving into the dashboard.

## The POC Boundary
In: CSV parse (commas, quotes, embedded newlines, semicolons, BOM), type/role inference with confidence badges, KPI cards, SVG bar + line charts, filter chips with cross-fade, single-file HTML export, ugly fixture CSVs, xss-payload.csv safety fixture, node test battery.
Out (see Explicitly Cut): Excel input, multi-file joins, custom chart builder, hosted sharing, any network call, any LLM/runtime AI.

## Later
Excel input, join two files, saved views, dark mode.

## Explicitly Cut
- Custom chart builder: defeats the zero-authoring kernel; cut with prejudice.
- Cloud upload / hosted dashboards: the offline privacy story is the differentiator; cut.
- AI/LLM calls at runtime: deterministic heuristics only — reproducible, free, offline.
- Multi-row header merging: graceful "couldn't infer" badge instead; never a nonsense KPI.
