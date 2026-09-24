import fs from "node:fs/promises";
import path from "node:path";
const directory = process.argv[2];
if (!directory)
  throw new Error("Usage: node scripts/index-report.mjs INDEX_DIRECTORY");
const manifest = JSON.parse(
  await fs.readFile(path.join(directory, "manifest.json"), "utf8"),
);
const pages = [];
for (const doc of manifest.documents) {
  for (let n = 1; n <= doc.pages; n++)
    pages.push({
      document: doc.name,
      ...JSON.parse(
        await fs.readFile(
          path.join(directory, doc.document, `${n}.json`),
          "utf8",
        ),
      ),
    });
}
const payload = JSON.stringify(pages).replaceAll("<", "\\u003c");
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Local document index review</title>
<style>body{font:16px system-ui;margin:2rem;max-width:1100px;background:#111827;color:#f3f4f6}input,select,button{font:inherit;padding:.6rem;margin:.3rem;background:#fff;color:#111}article{border:1px solid #64748b;padding:1rem;margin:1rem 0}pre{white-space:pre-wrap;overflow-wrap:anywhere}summary{cursor:pointer}label{display:block}small{color:#cbd5e1}</style>
<h1>Document index review</h1><p>Local native-text index. References are unverified mentions, not confirmed scope. Every page still requires visual review. No external requests are made by this report.</p>
<label>Search rooms, sheets, finishes or text <input id="query" type="search"></label><label>Document <select id="document"><option value="">All documents</option></select></label><p id="count" role="status"></p><main id="results"></main><button id="more">Show more pages</button>
<script type="application/json" id="data">${payload}</script><script>
const pages=JSON.parse(document.getElementById('data').textContent);const query=document.getElementById('query');const doc=document.getElementById('document');let limit=25;
for(const name of new Set(pages.map(p=>p.document))){const option=document.createElement('option');option.value=name;option.textContent=name;doc.append(option);}
function render(){const term=query.value.toLowerCase();const selected=pages.filter(p=>(!doc.value||p.document===doc.value)&&(!term||p.text.toLowerCase().includes(term)));document.getElementById('count').textContent=selected.length+' matching pages; showing '+Math.min(limit,selected.length);const root=document.getElementById('results');root.replaceChildren();for(const p of selected.slice(0,limit)){const article=document.createElement('article');const heading=document.createElement('h2');heading.textContent=p.document+' — PDF page '+p.page;article.append(heading);const info=document.createElement('p');info.textContent='Sheet mentions: '+p.sheetMentions.join(', ')+' | Room mentions: '+p.roomMentions.join(', ');article.append(info);const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Read native page text (layout may differ from drawing)';const text=document.createElement('pre');text.textContent=p.text;details.append(summary,text);article.append(details);root.append(article);}document.getElementById('more').hidden=selected.length<=limit;}
query.addEventListener('input',()=>{limit=25;render()});doc.addEventListener('change',()=>{limit=25;render()});document.getElementById('more').addEventListener('click',()=>{limit+=25;render()});render();
</script></html>`;
await fs.writeFile(path.join(directory, "review.html"), html, { mode: 0o600 });
console.log(`Wrote local review for ${pages.length} pages.`);
