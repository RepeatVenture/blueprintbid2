import { demoProject } from "../src/lib/demo.ts";
import { writeFile } from "node:fs/promises";
const p = demoProject();
p.id = "20000000-0000-4000-8000-000000000001";
p.scope[0].status = "Confirmed";
p.scope[0].responsibility = "Included by us";
await writeFile("fixtures/demo-project.json", JSON.stringify(p));
