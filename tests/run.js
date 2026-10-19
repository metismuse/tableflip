// TableFlip test battery — no dependencies. Run: node tests/run.js
const fs = require("fs"), path = require("path"), vm = require("vm");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const libSrc = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const sandbox = { module: { exports: {} } };
vm.runInNewContext(libSrc + "\nmodule.exports=TableFlip;", sandbox);
const TF = sandbox.module.exports;

let pass = 0, fail = 0;
function eq(a, b, name) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (ok) { pass++; } else { fail++; console.log("FAIL:", name, "\n  got:", JSON.stringify(a), "\n  want:", JSON.stringify(b)); }
}
function ok(cond, name) { if (cond) { pass++; } else { fail++; console.log("FAIL:", name); } }

/* ---------- PAR-01: parser battery ---------- */
let t = TF.parseCSV('a,b,c\n1,2,3\n4,5,6');
eq(t.headers, ["a", "b", "c"], "simple headers");
eq(t.rows.length, 2, "simple row count");

t = TF.parseCSV('name,note\n"Doe, John","line1\nline2"\nA,B');
eq(t.rows[0], ["Doe, John", "line1\nline2"], "quoted comma + embedded newline");

t = TF.parseCSV('a;"b;c"\n1;"x;y"');
eq(t.headers, ["a", "b;c"], "semicolon sniffing");

t = TF.parseCSV('\uFEFFa,b\n1,2');
eq(t.headers, ["a", "b"], "BOM stripped");

t = TF.parseCSV('a,b\n"He said ""hi""",2');
eq(t.rows[0][0], 'He said "hi"', "escaped quotes");

t = TF.parseCSV('');
eq(t.headers, [], "empty file");

t = TF.parseCSV('a,b\r\n1,2\r\n');
eq(t.rows.length, 1, "CRLF");

/* ---------- INF-01: inference battery ---------- */
function infer(csv) { const tt = TF.parseCSV(csv); return { t: tt, cols: TF.inferColumns(tt) }; }
let r = infer('ShipDt,"cost_usd ","STATUS!!",qty\n2026-01-05,"$1,234.56",delayed,4\n2026-02-11,"$89.10",ontime,12');
const byName = {}; r.cols.forEach(c => byName[c.name] = c);
eq(byName["ShipDt"].type, "date", "date type");
eq(byName["ShipDt"].role, "dimension", "date role");
eq(byName["cost_usd "].type, "money", "money type despite spaces");
eq(byName["cost_usd "].role, "measure", "money role");
eq(byName["STATUS!!"].type, "category", "category type");
eq(byName["qty"].type, "number", "number type");

r = infer('id\nXA-101\nXA-102\nXA-103\nXA-104\nXA-105\nXA-106\nXA-107\nXA-108');
const idc = r.cols.find(c => c.name === "id");
eq(idc.role, "id", "high-cardinality text -> id");

r = infer('mystery\nalpha\nbeta\ngamma\ndelta\nepsilon\nalpha\nbeta\nzeta');
eq(r.cols[0].confidence, "low", "mid-cardinality text -> low confidence");
ok(r.cols[0].role === "ignore", "mid-cardinality text -> ignore");

r = infer('when,amount\n01/05/2026,€1.234,56\n2026-02-11,€89,10');
eq(r.cols[1].type, "money", "euro money");

/* ---------- XSS-01: escape battery ---------- */
eq(TF.escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;', "script escaped");
eq(TF.escapeHtml('"onmouseover="x'), '&quot;onmouseover=&quot;x', "quotes escaped");
eq(TF.escapeHtml("a&b"), "a&amp;b", "amp escaped");

// end-to-end: adversarial CSV must render inert in dashboard + export
const evil = TF.parseCSV('name,amount\n<script>alert(1)</script>,$5\n<img src=x onerror=alert(2)>,10');
const ecols = TF.inferColumns(evil);
const dash = TF.dashboardHTML(evil, ecols, {}).html;
ok(!dash.includes("<script>alert"), "dashboard has no live script tag");
ok(dash.includes("&lt;script&gt;"), "dashboard escapes payload");
const css = "body{}";
const appJS = "var TableFlip={};";
const rep = TF.exportReport("evil", evil, ecols, {}, css, appJS);
// the embedded data JSON must contain no raw "<": payloads travel as \u003c and
// can never break out of the script block (verified XSS-01 class)
const dataSeg = rep.split("window.__TFDATA__=")[1].split(";</script>")[0].split(";document")[0];
ok(!dataSeg.includes("<"), "export data JSON has no raw < (no script break-out)");
ok(rep.includes("\\u003cscript>"), "payload neutralized as unicode escape in export");

/* ---------- aggregation sanity ---------- */
const g = TF.groupSum([["a", "10"], ["b", "20"], ["a", "5"]], 0, 1);
eq(g, [["b", 20], ["a", 15]], "groupSum desc");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
