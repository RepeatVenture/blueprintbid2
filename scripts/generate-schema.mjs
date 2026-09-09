import { z } from "zod";
import { projectSchema } from "../src/lib/model.ts";
import { writeFile } from "node:fs/promises";
const schema = z.toJSONSchema(projectSchema, { target: "draft-7" });
await writeFile(
  "supabase/project-schema.json",
  JSON.stringify(schema, null, 2) + "\n",
);
console.log(
  "Updated project-schema.json. Append a SQL migration when the persisted contract changes.",
);
