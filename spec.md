---
doc: spec
status: approved
---

# TableFlip — Technical Spec

## Stack
Single `index.html` — vanilla JS + CSS, no build step, no CDN, no network calls, ever. Node.js (present on dev machine) runs the test battery only; it is not part of the app.

## File Structure
```
index.html          # the entire app (markup + CSS + JS)
scope.md prd.md spec.md README.md LICENSE  # repo docs
fixtures/
  shipments-ugly.csv   # 12k-row logistics export, messy headers (generated, see provenance)
  sales-messy.csv      # semicolon-delimited, European decimals, BOM
  support-tickets.csv  # embedded newlines + quoted commas
  xss-payload.csv      # adversarial cells: <script>, <img onerror>, etc.
tests/
  run.js            # node test runner (no deps): parser battery + inference battery + escape battery
  fixtures.js       # shared tiny fixtures for unit tests
devpost/            # skill-pack working copies (not required by judges; root copies are canonical)
```

## Where It Runs and How Someone Tries It
Open `index.html` in any modern browser (double-click; `file://` is fine). No server, no install. Drop a CSV or click a fixture.

## Data Model
```js
Table = { headers: [String], rows: [[String]] }
Column = { name, index, type: 'date'|'money'|'number'|'category'|'text'|'unknown',
           role: 'measure'|'dimension'|'id'|'ignore', confidence: 'high'|'medium'|'low' }
```
Inference rules (deterministic, documented):
- Trim + normalize header (lowercase, strip non-alphanumerics) for keyword hits (`date|dt|ship`, `cost|price|amount|usd`, `qty|count|units`, `status|type|region|category`).
- Type by sampling ≤200 cells: date (≥3 common formats), money (currency symbols or `(...)` negatives), number (≥90% numeric after stripping `$ , %`), category (distinct ≤ min(20, 10% of rows)), else text.
- Role: money/number → measure; date/category → dimension; high-cardinality text that looks like an ID → id; unknown → ignore with "couldn't infer" badge.
- Confidence: keyword+type agreement → high; type only → medium; conflict/unknown → low + badge.
- Never emit a KPI for a low-confidence measure; never invent data.

## Components
1. **Parser** — RFC-4180-ish: quotes, escaped quotes, embedded newlines, delimiter sniffing (`,` vs `;`), BOM strip. Returns Table.
2. **Inference** — header normalization + cell sampling → Column[]. No nested-quantifier regexes (ReDoS guard).
3. **Renderer** — KPI cards (sum/avg/count, tabular numerals), SVG bar chart (top-8 categories), SVG line chart (date dimension × measure), filter chips (low-cardinality categories). Cross-fade via CSS.
4. **Exporter** — serializes current dashboard state into a standalone HTML string: inlines CSS/JS/data, **every cell value through `escapeHtml()` at this boundary** (XSS-01 choke point). Zero external refs.
5. **Fixtures generator** — `fixtures/gen.py`: script-generated CSVs with a provenance header comment (per 06 requirement).

## External Services
None. This is a feature: "your CSV never leaves this page."

## Failure Modes
- Ambiguous dates / numeric IDs / multi-row headers → "couldn't infer" badge; column ignored by charts (never a nonsense KPI).
- >50k rows → warning banner; still processes (perf target: 50k rows parse+infer <2s; benched 2026-10-19 on this VM: parse+infer+dashboard render = 582 ms; 12k-row export = 602 KB self-contained HTML, 0 external requests).
- Empty file / single column → friendly empty state, no crash.
- localStorage only for UI prefs; parsed data stays in memory (quota-safe).

## Decisions and Open Issues
- Single-file app chosen for the export story: the app and the report share the renderer.
- Hand-rolled SVG charts (no chart lib) to honor zero-network.
- License: MIT (visible at repo root for the judges' license check).
