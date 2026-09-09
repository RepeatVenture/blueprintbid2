# Living implementation plan

## Discovery — 2026-09-09

Repository initially contains README and the untracked owner charter only. No existing application, manifests, database, credentials, deployment configuration, or AGENTS.md found. Node 24.20.0 and npm 11.19.0 available; ripgrep unavailable. Preserve charter. No external services verified.

## Delivery sequence

- Phase 0: establish Next.js/TypeScript, test tooling, CI, environment template, architecture decisions.
- Phase 1: marketing, persistent local synthetic workspace, hosted authentication/organization/project/storage foundation with RLS.
- Phase 2: manual scope, editable assembly component costs, decimal estimate engine, qualifications, immutable proposal snapshots and PDF.
- Phase 3: evidence/review records and provider contracts; native-text assisted review where feasible; explicitly report unavailable OCR.
- Phase 4: explicit logistics/installation costs, duration and actual-cost comparison, internal handoff.
- Phase 5: server billing integration and operational/owner launch documentation, gated on credentials for live verification.

## Validation

Unit tests cover money, quantities, overrides, proposals and file validation. Type check, lint and production build after implementation. Database policies require a real PostgreSQL/Supabase instance to verify; never represent static inspection as an executed RLS test. Hosted end-to-end checks remain launch gates until configured.

## Immediate blockers

No Supabase, Stripe, email, OCR, hosting or DNS credentials are configured. No accounts will be created and no paid processing will run. Continue local development and document exact owner actions.

## Implemented phase outcomes — 2026-09-09

### Phase 0 — complete locally

Created the application/toolchain, lockfile, CI, environment template, ADRs, contributor/security instructions and this living plan. Repository had no reusable application code. The charter remains unchanged and untracked alongside new implementation files; no Git commit/push was performed.

### Phase 1 — working hosted foundation; external verification pending

Marketing and synthetic demo work without credentials. Auth UI, organization/project routes, private upload/inventory/download, membership/invitation RPCs and RLS are implemented. SQL was exercised against clean PostgreSQL databases with minimal Supabase contracts. Real Supabase Auth, SMTP and Storage HTTP require staging credentials. See the continuation entry for implemented recovery, member revocation and project Data API validation. Owner transfer and deletion/organization export remain engineering work.

### Phase 2 — useful manual-estimating slice implemented

Editable room scope and component assemblies, immutable reusable assembly versions, decimal calculation, markup/margin distinction, qualifications, vendor comparisons, structured risks, allowances/alternates/unit prices, proposal preview/PDF and issued snapshots work locally. Tests cover calculations, risk gates and generated-PDF privacy. Dimension/formula-driven nested assemblies, mature material catalogs/yield UI, Unicode/logo PDF support and granular collaboration remain.

### Phase 3 — native-text assisted review implemented; OCR deferred

Private hosted PDF inventory, native provider contract, keyword/page candidates, manual evidence review, original source download, usage history and retry lease implemented. Real synthetic PDF extraction is unit tested. No paid AI/OCR, visual takeoff, thumbnails/source regions, automatic conflicts or calibrated accuracy. Isolated durable processing, quarantine and tenant usage budgets remain launch gates.

### Phase 4 — logistics/handoff foundation implemented

Explicit delivery/installation arithmetic, outside quote comparison, crew duration, risks, awarded handoff and total actual-cost variance work. Detailed route constraints, critical-path scheduling and operation/category actual imports remain.

### Phase 5 — billing and launch preparation implemented; not launched

Stripe-hosted checkout/portal, signed webhooks, atomic idempotency and database project caps implemented. No Stripe account or real lifecycle tested. Legal pages are visibly incomplete. README covers owner setup, DNS, email, billing, operations, privacy and launch sequence. Docker artifact/CI included; production backups, monitoring, legal approval, tax decisions and live deployment remain unverified.

## Validation and issues discovered

See docs/validation.md. Local checks discovered and fixed an ambiguous storage policy reference that denied legitimate reads, a test selector mismatch, missing browser system libraries and tooling compatibility issues. No checks were disabled to hide failures.

## Safest next development priority

Close the hosted security/integration boundary: provision an owner-controlled staging Supabase project, verify Auth/Storage end to end, verify database aggregate write validation and complete account lifecycle, then isolate document processing with malware quarantine. Exercise Stripe test lifecycle before public billing. Continue the remaining estimating capabilities against representative, authorized synthetic/evaluation fixtures rather than promising unattended drawing takeoff.

## Continuation — project integrity, access lifecycle and billing concurrency

Added generated Postgres project-shape validation, explicit numeric/identity checks, authoritative SQL proposal projection and decimal.js parity fixtures. Direct writes cannot inject their own customer snapshot or bypass scope/risk gates. Added per-organization checkout reservations with stable Stripe idempotency keys and no overlapping plan attempts. Added Supabase PKCE password recovery UI/callback, owner/admin member directory and guarded revocation coordinated with invitation acceptance. Earlier phase notes describing these as missing are superseded by this entry. Real Auth/SMTP/Stripe/Storage integration still needs owner-provided staging accounts. Owner transfer, full export/deletion, auxiliary write validation, durable malware-isolated processing and production operational verification remain next priorities.

## Current validation checkpoint

Type checking, lint, 22 unit/schema tests, eight clean-database migrations with security/arithmetic assertions, four production-browser scenarios and container packaging/health/header checks pass. No external account setup, real email, Stripe lifecycle, hosted Supabase integration or deployment is claimed. README is the owner runbook; docs/owner-decisions.md separates owner actions from remaining engineering work. No commit or push performed.

## Priority correction — visual extraction is core product work

Owner clarified that drawing/image interpretation is the central purpose, not a later convenience. Next slice: authenticated PDF/PNG/JPEG visual analysis using a configurable vision provider; page-selected processing, structured quantities/dimensions/materials/hardware/source evidence/conflicts, review-to-scope transfer, bounded provider usage and honest unavailable/error states. No real provider calls without owner-configured credentials and explicit paid-processing enablement. Live accuracy remains unverified until representative drawings are evaluated.

## Visual extraction implementation checkpoint

The priority correction slice is implemented: PDF/PNG/JPEG input, selected-page OpenAI Responses integration, strict structured evidence and quantities, review-to-scope transfer, explicit paid-processing consent and a database-enforced 25-call daily organization cap. Invalid/incomplete responses fail closed; unknown quantities are cleared. Configuration and live evaluation remain owner actions described in README. This supersedes earlier notes saying no external LLM integration exists.

Validation: 27 offline unit tests, lint/type checking, production build, four browser regressions and all nine database migrations with visual quota/cross-tenant tests pass. No live model calls or recognition-accuracy evaluation were performed. Whole-set reconciliation, durable processing, overlays and calibrated accuracy remain engineering work.
