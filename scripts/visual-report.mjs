import fs from "node:fs/promises";
import path from "node:path";
import { roundLinearFeet } from "../src/lib/quantities.ts";
const [input, image] = process.argv.slice(2);
if (!input || !image)
  throw new Error("Usage: node scripts/visual-report.mjs RESULT.json CROP.png");
const run = JSON.parse(await fs.readFile(input, "utf8"));
if (run.status !== "completed")
  throw new Error("A completed result is required");
const escape = (s) =>
  String(s ?? "Unknown")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const png = await fs.readFile(image);
const items = run.result.items
  .map(
    (i, n) =>
      `<tr><td>${n + 1}</td><td>${escape(i.description)}<p>${escape(i.dimensions)}</p></td><td>${escape(i.physicalCount)}</td><td>${escape(i.quantity === null ? null : i.unit === "LF" ? roundLinearFeet(i.quantity) : i.quantity)} ${escape(i.unit || "")}<p>Original: ${escape(i.quantity)}</p></td><td>${escape(i.furnishing)} / ${escape(i.installation)}</td><td>${escape(i.evidence)}<p>${escape(i.uncertainties.join("; "))}</p></td></tr>`,
  )
  .join("");
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Focused takeoff review</title><style>body{font:16px system-ui;margin:2rem;color:#172033}img{width:100%;max-width:2200px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #999;padding:.6rem;vertical-align:top}p{font-size:.9rem}th{text-align:left}.warning{background:#fff2c8;padding:1rem}</style><h1>Focused takeoff review</h1><p class="warning">Draft model output. All quantities, room assignments and responsibilities need estimator verification. This is not an approved estimate. LF is rounded to the nearest half foot by program code.</p><p>Model ${escape(run.model)}, ${escape(run.promptVersion)}. Estimated model cost $${escape(run.estimatedCostUSD)}.</p><img alt="Original drawing detail used for this extraction" src="data:image/png;base64,${png.toString("base64")}"><h2>Proposed scope</h2><table><thead><tr><th>Item</th><th>Description and dimensions</th><th>Physical count</th><th>Total estimating quantity</th><th>Furnish / install</th><th>Evidence and uncertainty</th></tr></thead><tbody>${items}</tbody></table><h2>Issues reported by model</h2><ul>${[...run.result.conflicts, ...run.result.missingInformation].map((x) => "<li>" + escape(x) + "</li>").join("")}</ul></html>`;
const target = path.join(
  path.dirname(input),
  path.basename(input, ".json") + "-review.html",
);
await fs.writeFile(target, html, { mode: 0o600 });
console.log("Wrote private review report.");
