---
doc: prd
status: approved
---

# TableFlip — Product Requirements

## What We're Building
A single-file, fully offline web app. A user drops a messy CSV; TableFlip parses it, infers what each column is (date, money, category, number, text) and what role it plays (measure, dimension, id), then auto-builds a dashboard: KPI cards for measures, bar/line charts for dimension×measure pairs, filter chips for low-cardinality categories. One click exports the whole thing as a portable single-file HTML report.

## The Core Journey
1. **Land.** User opens index.html. Sees a drop zone, "or try a fixture" buttons, and one line: "Your CSV never leaves this page."
   - *Acceptance:* page renders with zero network requests; drop zone + 3 fixture buttons visible.
2. **Drop.** User drops an ugly CSV (or clicks a fixture). A raw grid preview appears with per-column badges: inferred type, role, confidence.
   - *Acceptance:* badges appear for every column; ambiguous columns show "couldn't infer" rather than a wrong guess; parse handles quoted commas, embedded newlines, semicolons, BOM.
3. **Flip.** User clicks "Build dashboard" (or it auto-flips). The grid dissolves into the dashboard: KPI cards (sum/avg/count of measures), one bar chart and one line chart for the top dimension×measure pairs, filter chips.
   - *Acceptance:* dashboard renders ≤2s for the 12k-row fixture; charts are real SVG generated from the data; filters cross-fade and recompute KPIs.
4. **Explore.** User clicks filter chips (e.g., STATUS = "delayed"). KPIs and charts update.
   - *Acceptance:* every chip recomputes from the filtered row set; "clear" restores.
5. **Export.** User clicks "Export report". A standalone .html downloads; opened with network disabled it shows the same dashboard.
   - *Acceptance:* exported file contains zero external references; cell content is HTML-escaped (xss-payload.csv renders as inert text); opens and renders offline.

## Look and Feel
Light theme, generous whitespace, single accent (indigo). Cards with soft shadows. The flip transition: grid rows fade/scale into dashboard cards (~600ms). Badges: small pills — green (high confidence), amber (medium), gray ("couldn't infer"). Typography: system stack, tabular numerals for KPIs. No modals, no settings pages.

## What We're NOT Building
Anything under scope.md > Explicitly Cut. Also: no chart-type picker, no saved sessions (prefs only in memory), no mobile-specific layout beyond responsive basics.

## Open Questions (resolved)
- Q: What if inference is wrong? A: Confidence badges + "couldn't infer" fallback; user can flip a column's role via a small control (dimension/measure/ignore). This is a correction affordance, not a chart builder.
- Q: Huge files? A: >50k rows shows a polite warning; parsing stays in memory; perf target 50k rows <2s for parse+infer (benched, recorded in spec).
