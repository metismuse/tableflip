# TableFlip

**Ugly CSV in, dashboard out.** Drop a messy spreadsheet export — ragged headers, mixed date formats, currency symbols that come and go — and TableFlip figures out every column and builds a live dashboard. Zero chart authoring. Your data never leaves the page.

Built with the Devpost Learn Skill Pack (plan-first, in a day) for the **Build With AI: Basics** monthly hackathon.

## Try it

Open `index.html` in any browser. No build step, no server, no dependencies. Drop a CSV or click a sample dataset.

## What it does

- **Forgiving CSV parser** — quoted commas, embedded newlines, escaped quotes, `;`-delimited files, BOM, CRLF
- **Column inference with confidence badges** — date / money / number / category / text detection, measure-vs-dimension roles, honest "couldn't infer" fallback
- **Auto dashboard** — KPI cards for measures, bar charts for categories, line charts over dates, one-click filter chips that recompute everything
- **One-click HTML export** — the whole dashboard as a single self-contained file that works offline (zero network requests)
- **XSS-hardened by construction** — every value passes through a single `escapeHtml` choke point; the export embeds data as `<`-escaped JSON so hostile cells render inert (26-test battery, all green)

## Fixtures

`fixtures/` holds four script-generated CSVs (see `fixtures/gen.py`, seeded — reproducible):

| file | what it proves |
|---|---|
| `shipments-ugly.csv` | 12,000-row messy logistics export: ragged headers, 3 date formats, mixed `$`/bare costs |
| `sales-messy.csv` | semicolon-delimited, UTF-8 BOM, European decimals |
| `support-tickets.csv` | embedded newlines + quoted commas in cells |
| `xss-payload.csv` | adversarial cells — must render inert, never execute |

Regenerate: `python3 fixtures/gen.py`. Run tests: `node tests/run.js`.

## Docs

- `scope.md` — what this is and isn't (problem, non-goals)
- `prd.md` — product requirements and acceptance criteria
- `spec.md` — technical specification, measured performance (50k rows in 582 ms)

## License

MIT — see `LICENSE`.
