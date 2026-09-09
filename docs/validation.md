# Validation report — 2026-09-09

## Local evidence

- Node 24.20.0, npm 11.19.0; dependencies locked in package-lock.json.
- `npm run typecheck`: passed.
- `npm run lint`: passed using compatible ESLint 9.39.5.
- `npm test`: 22 tests passed across 3 files. Includes money/markup/margin/tax/waste, excluded scope, logistics/capacity, independent overrides, grain-fixed sheet layout, risk/allowance/alternate boundaries, immutable customer projections, real PDF generation and extraction, scanned-page warning, body bounds and rate guard.
- `npm run build`: production compilation and TypeScript validation passed outside the restricted execution sandbox; application/API routes built. No ignoreBuildErrors or type/lint bypass used.
- Browser tests: all 4 scenarios passed against a production server: manual save/reopen/issue/PDF download; automated axe WCAG checks on marketing/demo; unconfigured auth and origin rejection; commercial items and evidence-to-scope review. Rendered marketing and workspace screenshots were also visually inspected.
- `npm run test:db`: all eight migrations passed on a fresh PostgreSQL 17 database. SQL assertions passed for tenant reads/writes, viewer role, membership escalation, immutable proposals, stale revision, forged storage path, email-bound single-use invitations, billing event replay/ordering, project caps, own/private-object visibility and processing claim isolation.
- `npm install --package-lock-only --ignore-scripts`: audit reported zero known vulnerabilities across 410 packages. This is not a security certification.
- `npm run seed:fixture`: generated a two-page legally synthetic PDF, with native text and blank-page OCR review case.

## Issues found and fixed

The expanded positive storage test discovered `d.path=name` resolving `name` against document metadata rather than the outer storage object. It now explicitly compares `d.path=storage.objects.name`; both authorized read and cross-tenant denial pass. Browser workflow test used an exact implicit-label selector that did not match Playwright's label lookup; it now uses the rendered combobox role/name. Missing Chromium shared libraries were installed before browser execution. ESLint 10 was incompatible with Next's current React plugin; the tested compatible version is pinned. The sandboxed Next TypeScript CLI child output failed to parse, while standalone type checks and unrestricted builds passed.

## Limits of the evidence

The database bootstrap only models Supabase's auth.uid/roles/storage tables. It does not verify actual GoTrue JWT validation, email, hosted PostgREST defaults, Storage HTTP transfers or production provider configuration. Local browser tests use synthetic demo data; they do not claim live signup, hosted upload, invitation email or Stripe integration coverage.

No customer plan sets, external OCR/AI, DNS, production deployment, real Stripe checkout, SMTP delivery, database/object restore, independent penetration test or paid service was used. The SQL webhook test verifies local atomic replay behavior, not Stripe's signature delivery. Those remain launch gates.


## Continuation security checks

All eight migrations passed on a fresh database. Added negative tests for malformed direct project writes, singular margin, excessive waste, unknown fields, mismatched project IDs and unreviewed proposal issuance. The database regenerates customer-safe snapshots; three full JSON projection fixtures match decimal.js for markup, margin, fractional quantity/waste/tax, allowances, add/deduct alternates and unit prices. Checkout reservations retain a stable attempt ID, reject overlapping plan attempts and enforce organization permissions. Member revocation immediately removes RLS access, blocks self/owner removal and coordinates with invitation acceptance. Schema drift/unsupported-keyword tests bring the unit total to 22 across 3 files.

Password recovery UI and fixed PKCE callback are implemented, but no real recovery email has been sent or verified. New membership and checkout behavior still requires hosted Supabase/Stripe integration tests.

## Container and final browser evidence

The Docker image built successfully with runtime `next.config.mjs`. Its local, non-public container ran as UID 1000, returned 200 for `/` and `/api/health`, served `X-Frame-Options: DENY` and CSP, and omitted X-Powered-By. Health correctly reported hosted and billing configuration absent. This verifies packaging/configuration, not deployment or provider connectivity. The subsequent application build including password recovery and member-management routes passed. All four browser scenarios passed again against that updated production build.
