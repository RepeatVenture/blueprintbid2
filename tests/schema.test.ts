import { it, expect } from "vitest";
import { z } from "zod";
import { projectSchema } from "../src/lib/model";
import schema from "../supabase/project-schema.json";
import { readFileSync } from "node:fs";
it("keeps application and persisted aggregate schemas in sync", () => {
  expect(z.toJSONSchema(projectSchema, { target: "draft-7" })).toEqual(schema);
  const migration = readFileSync(
    "supabase/migrations/202609090005_project_validation.sql",
    "utf8",
  );
  const embedded = migration.split("$shape$")[1];
  expect(JSON.parse(embedded)).toEqual(schema);
});
it("only emits keywords supported by the finite Postgres shape validator", () => {
  const supported = new Set([
    "$schema",
    "type",
    "properties",
    "required",
    "additionalProperties",
    "items",
    "maxItems",
    "minLength",
    "maxLength",
    "pattern",
    "enum",
    "minimum",
    "maximum",
    "exclusiveMinimum",
    "default",
  ]);
  function walk(node: Record<string, unknown>) {
    for (const [key, value] of Object.entries(node)) {
      expect(supported.has(key), key).toBe(true);
      if (key === "properties")
        Object.values(value as object).forEach((v) => walk(v));
      if (key === "items") walk(value as Record<string, unknown>);
    }
  }
  walk(schema);
});
