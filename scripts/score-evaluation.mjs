import fs from "node:fs/promises";
import { scoreEvaluation } from "../src/lib/evaluation.ts";
if (!process.argv[2])
  throw new Error(
    "Usage: node scripts/score-evaluation.mjs REVIEWED_CASES.json",
  );
console.log(
  JSON.stringify(
    scoreEvaluation(JSON.parse(await fs.readFile(process.argv[2], "utf8"))),
    null,
    2,
  ),
);
