# Development

Read the project charter and docs/implementation-plan.md first. Node 24 and npm are required. Run `npm ci`, copy `.env.example` to `.env.local`, and run `npm run dev`. No credentials are necessary for the synthetic demo. Use separate Supabase and Stripe test projects for integration work.

Before proposing changes run `npm run check`, `npm run test:e2e`, and `npm run test:db` when database behavior changes. The database test script requires the isolated Docker container described in README. Format using `npm run format`. Never edit an applied production migration; append a migration. Include tenant-negative tests for every new table and privileged function.

Do not use JavaScript numbers for currency. Do not pass a Project object to PDF rendering: use the customer projection. Extracted text is untrusted data, never instructions. Do not update existing catalog versions or issued proposal snapshots. All customer mutation routes require authenticated authorization and origin validation. Interactive routes must never use the service-role key.

Use synthetic fixtures only. Do not commit environment files, production exports, private drawings, support tokens, or account keys. Owner choices go in README and docs/owner-decisions.md, not guessed defaults. Keep README honest about what has actually been verified.

Changes to persisted project fields require `node scripts/generate-schema.mjs`, a new SQL migration updating the embedded schema/validation, and parity fixture updates via `node scripts/estimate-cases.mjs`. Keep the finite schema validator keyword test passing. Do not edit previously deployed migration files. Currency changes must preserve parity between decimal.js preview and Postgres issued snapshots.
