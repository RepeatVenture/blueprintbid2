# BlueprintBid — owner and operator guide

BlueprintBid is an evidence-first millwork estimating application built from the project charter in [BlueprintBid_Codex_Master_Build_Prompt.md](BlueprintBid_Codex_Master_Build_Prompt.md). This repository now contains a working manual-estimating evaluation build and a hosted SaaS foundation. **It is not production-ready. No external accounts, production deployment, DNS, live payments, email delivery, backups or AI services have been configured or verified.**

Local validation passes: type checking, lint, 22 unit/schema tests, four browser scenarios, eight database migrations with isolation/integrity tests, production build, and container startup/security headers. See [the validation report](docs/validation.md) for the scope of that evidence.

Start with the browser-local synthetic demo. It needs no account or payment. Use only synthetic information until the hosted security and operations gates below are closed.

## A. What was built

### Implemented

- Responsive dark marketing site, workflow, planned pricing, FAQ, login, draft legal pages, metadata, robots and sitemap.
- Persistent browser-local sample estimate, clearly labeled as synthetic; explicit save states and internal JSON/CSV export.
- Hosted email/password signup and login UI, organization creation, project list/create/edit/save, invitation codes, server authorization and Postgres RLS.
- Scope by room, quantity/unit, review state, responsibility, source reference, evidence and internal notes; filter, duplicate and editable component breakdown.
- Materials, hardware, labor, finishing, subcontract, delivery, installation and engineering cost categories; editable quantity, unit cost, waste and taxability.
- Reusable company assembly templates with immutable versions and independent project instances.
- Decimal arithmetic for cost, overhead, contingency, tax allowance, markup, margin and gross profit. No AI arithmetic.
- Qualifications/exclusions/terms, structured risk/RFI register, vendor quote comparison, allowances, add/deduct alternates and unit prices.
- Explicit delivery and installation allowances, outside-delivery comparison, person-hour capacity duration and a total actual-cost comparison.
- Customer-safe proposal preview and actual downloadable PDF; fixed issued snapshots, revision checks and internal audit history.
- Awarded-project internal handoff JSON export.
- Private PDF/PNG/JPEG upload/inventory and authenticated original download; native PDF text extraction, page citations, low-confidence keyword candidates and manual review; retry leases.
- Stripe checkout/portal endpoints, verified webhook handler, atomic event idempotency and database-enforced project limits.
- Unit tests, browser workflow/accessibility tests, PostgreSQL isolation tests, CI, a Dockerfile, a synthetic PDF generator and operations documentation.

### Partially implemented / not yet launch-ready

Hosted flows require Supabase setup and real Auth/Storage verification. Stripe handlers require actual test-mode lifecycle verification. Project data is validated in both the application and PostgreSQL. Direct writes must pass the generated aggregate schema, numeric checks, revision checks and authoritative customer-snapshot generation. Real Supabase deployment grants and auxiliary catalog/document write boundaries still require staging review. Project limits are enforced, but storage/page/user quotas and production trial-abuse protections are not complete.

Document processing supports native PDF text and an optional OpenAI vision integration for selected PDF pages and PNG/JPEG images. Both run synchronously; there is no durable worker. File signature checks are not antivirus. Catalog UI supports assembly/component templates; it is not yet a complete purchasing database. Vendor/RFI and schedule tools are foundations, not mature buyout or critical-path scheduling. Actual cost is currently a single total, not departmental import/reporting.

The PDF uses a standard ASCII font and replaces unsupported characters with `?`; review the generated output. It has company text branding, not uploaded logos or a complete style designer. Draft PDFs are labeled as drafts. Exported internal projects and handoffs contain sensitive costs and must not be sent to customers.

### Deferred features and honest AI status

No dedicated OCR engine, verified drawing measurement, evaluated symbol recognition, dimension-based nested assembly formulas, advanced nesting, source-region highlighting, thumbnails, automated cross-document conflicts, measured AI accuracy, automated RFQ sending, actual-cost imports, owner transfer, organization deletion/export jobs, tax compliance automation, error-monitoring vendor or analytics are implemented.

Keyword confidence is a low review-priority marker, not a calibrated accuracy score. Construction drawings remain the estimator's responsibility to verify. Missing credentials do not explain all these gaps: the remaining engineering work is explicitly tracked in [docs/owner-decisions.md](docs/owner-decisions.md) and [docs/implementation-plan.md](docs/implementation-plan.md).

## B. Local Codespace operation

### First start — commands in order

Prerequisites: Node.js 24, npm, this repository and a browser. Docker is needed only for database tests. Linux browser tests also need the Playwright dependencies. In the Codespace terminal:

```bash
node --version
npm --version
npm ci
cp .env.example .env.local
npm run seed:fixture
npm run dev
```

Open the Codespace **Ports** panel, find port **3000**, and choose **Open in Browser**. Open `/demo` for the sample estimate. Keep port visibility private. On a regular computer use `http://localhost:3000/demo`.

For Codespaces, copy the actual forwarded HTTPS URL from the Ports panel into `NEXT_PUBLIC_APP_URL` in `.env.local`, then restart the development server. The mutation routes require the browser's exact origin; an incorrectly configured URL causes save/upload/PDF requests to be rejected. Do not put a trailing path in this variable. The local browser-test suite uses `http://localhost:3000`.

The environment file is ignored by Git. Leave Supabase/Stripe values empty for the demo. Stop the server with Ctrl+C. Restart after environment changes.

### Try the manual workflow

1. Open the sample and choose **Inspect / edit** on the base cabinet.
2. Review description, quantity, room and synthetic evidence. Edit components to represent a real estimating method, using synthetic amounts during evaluation.
3. Set review to **Confirmed** and responsibility to **Included by us** only after reviewing the scope.
4. Inspect price strategy and cost reconciliation. Try 25% markup versus 25% target margin; they produce different selling prices.
5. Enter delivery/installation assumptions, qualifications and terms. Use Commercial review for allowances, alternates, quote comparisons and risks.
6. Select **Save project** and wait for the saved message.
7. In Proposal, resolve issuance warnings, select **Issue new version**, then **Save project** again.
8. Download the customer PDF. Later edits affect the draft; select the issued version to see its fixed snapshot.
9. Reload the page to verify persistence. Export the internal project JSON before clearing browser storage.

The demo seed is generated when no saved project exists; `npm run seed:fixture` separately creates `fixtures/synthetic-millwork.pdf`. There is no database seed command that adds synthetic users to Supabase. Create test users and projects through the hosted UI. Demo and hosted storage are separate; the app does not silently transfer demo data to a hosted organization.

### Database setup

For hosted evaluation follow section C, then run each file in `supabase/migrations` in lexical order in the Supabase SQL Editor. Run once on a fresh staging project. Apply all eight migration files through `202609090008_member_management.sql`; later migrations add aggregate validation, authoritative proposal generation, checkout reservations and member management. Never paste `tests/database/bootstrap.sql` into Supabase: it is a local test shim.

For repeatable local PostgreSQL policy tests:

```bash
docker run --name blueprintbid-test-db -e POSTGRES_HOST_AUTH_METHOD=trust -d postgres:17-alpine
docker exec blueprintbid-test-db pg_isready -U postgres
npm run test:db
```

Wait until pg_isready reports accepting connections. The container has no published port. Trust authentication is **only** for this isolated disposable test container, never a production database. Each test run creates a fresh database inside it. `docker stop blueprintbid-test-db` stops it when finished; `docker start blueprintbid-test-db` resumes it. No customer information belongs there.

### Checks and production preview

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
npm run test:db
npm run start
```

Stop any development/preview server before browser tests so they use the production build. Playwright starts its own server. `npm run check` combines type check, lint, unit tests and production build. Browser and database suites are separate. `npm run format` formats code/docs. The build was successfully tested outside the execution sandbox; sandboxed Next TypeScript child processes failed to return parsable output. Do not disable type checks to bypass that issue.

There is no separate worker command yet. Hosted native processing runs in the API request. A crashed claim becomes retryable after two minutes.

## C. External accounts and settings

### GitHub — source and CI

The repository is already in GitHub/Codespaces context; account ownership and settings were not changed. Account creation, if needed: [GitHub signup](https://github.com/signup). Keep this as an owner-controlled BlueprintBid repository; require MFA and protected branches. Source control is useful locally and required for the included GitHub Actions workflow. No GitHub key is needed in `.env.local`; avoid creating a broad personal token just to run the app. Free/paid availability depends on your account and runner usage; confirm in billing before enabling large workloads. Test by running CI on a branch. Revoke personal/access tokens in GitHub account settings and rotate any deployment credentials separately.

### Supabase — required for hosted accounts, database and private documents

Signup: [Supabase dashboard](https://supabase.com/dashboard). Create an organization you control and a project named `blueprintbid-staging`; later create a separate `blueprintbid-production`. Choose the data region based on customers and privacy needs. Store the database password in your password manager, not Git. Evaluation may fit a free offering, but production backup, capacity and availability needs must drive your paid-plan decision; no current price is assumed here.

1. In the project's Connect/API settings, copy the **Project URL** to `NEXT_PUBLIC_SUPABASE_URL`.
2. Copy the **publishable** browser-safe key to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Do not use the secret/service-role key there.
3. Apply the repository migrations in order. Confirm RLS is enabled on all application tables and `bid-documents` is private with a 20 MiB PDF limit.
4. Enable email/password authentication and email confirmation. Set Site URL to your actual app URL. Add only your actual local/staging/production URLs to allowed redirect URLs. Set a password policy of at least 12 characters to match the UI.
5. Configure custom SMTP before testing general customer email. Supabase's default sender has delivery restrictions; see [official SMTP setup](https://supabase.com/docs/guides/auth/auth-smtp).
6. Restart/rebuild after public environment values change. Sign up, confirm email, sign in, create an organization/project, save and reload.
7. Create another test account and organization. Prove it cannot read the first project's data or source PDF, including direct API attempts.

For billing webhooks only, copy the server **service-role/secret administrative key** to `SUPABASE_SERVICE_ROLE_KEY` in the server secret store. This is highly sensitive and bypasses RLS. The interactive app never needs it. Rotate/revoke in Supabase key settings, update server secrets and rebuild if public keys changed; then repeat integration checks. Do not rotate legacy JWT signing material without reviewing session/token impact in Supabase's current documentation.

### Stripe — required only for billing evaluation and paid launch

Signup: [Stripe registration](https://dashboard.stripe.com/register). Use an owner-controlled business account and a test/sandbox environment named for BlueprintBid staging. Creating a test integration does not configure business verification, payouts or live charges. Review Stripe's pricing and your business eligibility yourself; no paid transaction was made.

The server secret key belongs in `STRIPE_SECRET_KEY`. The signing secret for this endpoint belongs in `STRIPE_WEBHOOK_SECRET`. Product price IDs go in `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO` and `STRIPE_PRICE_STUDIO`. Keys and webhook secrets are secret; price IDs are identifiers but are still kept server-side in this application. No Stripe publishable key or card fields are used: customers enter payment details on Stripe-hosted pages. Full setup and tests are in section E. Rotate API keys in Stripe developer settings, and rotate webhook secrets on the endpoint; update the deployment secret store and test signed delivery afterward.

### Hosting and DNS — owner selection required

No hosting provider has been selected or connected. The implemented runtime is Node 24/Docker; choose a host that supports 21 MiB request bodies, at least 60-second requests, HTTPS, secret storage and persistent application processes. Use project names `blueprintbid-staging` and `blueprintbid-production`. Local demo operation does not require hosting. Production capacity and support usually cost money; approve those costs before provisioning. Follow [docs/deployment.md](docs/deployment.md) and the selected host's official signup/setup pages once chosen. There is deliberately no invented signup link, IP address, hostname or completed deployment claim.

The owner already controls `blueprintbid.com`; use the existing registrar/DNS account. Account access and DNS provider identity were not available. No DNS API token is required by this app. Use MFA; revoke unused registrar/host tokens in those accounts. Test with DNS lookup and HTTPS as described in section D.

### Email, monitoring, analytics, OCR/AI and tax services

The only integrated sender is Supabase Auth, configured through its SMTP dashboard for confirmation and password recovery. No specific SMTP vendor is selected or directly integrated; do not add guessed email API keys to `.env.local`. An SMTP account/server and verified sending domain are needed before customer email; the provider's host/port/user/password go in Supabase's SMTP configuration, not this app. See section F.

OpenAI is integrated for optional visual document analysis. Owner action: create an OpenAI API account at https://platform.openai.com, configure billing and project spending limits, create a server-only API key, and choose a model supporting image/PDF input and structured outputs. Set OPENAI_API_KEY, OPENAI_VISION_MODEL and VISION_ENABLED=true in the server environment. Never expose the key through NEXT_PUBLIC variables. Analytics, error tracking and automated tax vendors remain unconfigured.

## D. Domain setup for blueprintbid.com

Nothing is deployed at the domain by this build. Use one origin initially: `https://blueprintbid.com`, with the app at `/workspace`. Redirect `www.blueprintbid.com` to the apex. An `app` subdomain is unnecessary in this version. Use a separate restricted staging hostname if desired.

1. Deploy staging and obtain the real host-provided domain or IP. Add `blueprintbid.com` and `www.blueprintbid.com` in the hosting dashboard only when ready.
2. The host will provide exact records. For an IP-based host, the apex normally uses **A**, name **@**, value **the assigned IPv4 address**. Add **AAAA** only if the host explicitly supports and supplies IPv6. For managed domain mapping, use the host-provided **CNAME/ALIAS/ANAME** instructions instead; apex support varies by DNS provider.
3. For **www**, use the host-specified **CNAME** target, then configure the HTTP redirect to the apex at the hosting layer. DNS alone does not create an HTTP redirect.
4. Obtain any verification **TXT** name/value from the hosting dashboard. Do not guess targets from examples.
5. **Do not overwrite unrelated MX, TXT, SPF, DKIM, DMARC, or existing service records.** Export/screenshot the current zone before changes.
6. Wait for DNS caches to expire; different networks can see changes at different times according to TTL. Verify `dig blueprintbid.com A`, `dig www.blueprintbid.com CNAME`, and the host's domain verification status.
7. Let the host issue/manage the HTTPS certificate. Verify `curl -I https://blueprintbid.com` and `curl -I https://www.blueprintbid.com`; confirm valid TLS and the intended redirect. Do not send customers to a certificate-warning page.
8. Set `NEXT_PUBLIC_APP_URL=https://blueprintbid.com`, update Supabase Site/redirect URLs and Stripe webhook/portal settings, then rebuild.

Email domain records must come from the chosen sender: SPF **TXT**, DKIM **TXT or CNAME**, and DMARC **TXT** under `_dmarc`, with exact names/values provided by that service. Do not create multiple independent SPF records at the same hostname. Have the email operator reconcile existing mail services first.

## E. Stripe and making money

Paid signup is not advertised as open. Marketing prices are launch assumptions: Starter $79/month, Pro $179/month, Studio $399/month. The code currently uses a seven-day trial with payment method collection required.

### Test-mode setup

1. In Stripe's test/sandbox environment, create three products, each with a recurring monthly USD price. Use the proposed amounts only if you approve them. Copy each `price_…` identifier into the corresponding server variable.
2. Copy the test secret key into `STRIPE_SECRET_KEY`. Never use a live key in local evaluation.
3. Configure Billing's customer portal to allow the intended plan changes, payment-method updates and cancellation. Review proration and cancellation timing in the dashboard.
4. Create a webhook endpoint at `https://YOUR-STAGING-HOST/api/billing/webhook` for `customer.subscription.created`, `customer.subscription.updated` and `customer.subscription.deleted`. Copy that endpoint's signing secret into `STRIPE_WEBHOOK_SECRET`.
5. Set the server Supabase administrative key so the verified webhook can sync subscriptions. A checkout redirect does **not** grant paid access; the signed subscription event does.
6. Sign in as organization owner/admin. In the hosted project list, use Team & billing to choose a plan and open checkout. Confirm a card is required and the trial is shown before completing the test.
7. Verify Stripe's event delivery is successful and `subscriptions` contains the organization's current plan/status. Re-deliver an event and confirm it is not applied twice.

For local webhook forwarding, install/authenticate the official Stripe CLI in test mode, then:

```bash
stripe listen --events customer.subscription.created,customer.subscription.updated,customer.subscription.deleted --forward-to localhost:3000/api/billing/webhook
```

Use the signing secret printed by that listener in your local server environment and restart. The local listener's secret is different from the dashboard endpoint secret. Do not paste it into tickets or Git.

Use Stripe's published test payment details from [Billing test guidance](https://docs.stripe.com/billing/testing), never a real card. Exercise successful trial, trial end, failed renewal, upgrade/downgrade, cancellation, duplicate event and delayed event. Use Stripe test clocks where applicable. Real test-mode checkout and mail delivery were not executed in this build.

### Entitlements and limitations

Evaluation organizations without a subscription record may create **3 projects**. Active/trialing plans allow **10 / 50 / 200** total projects for Starter/Pro/Studio. The limit is enforced inside Postgres and concurrent project creation is serialized. Existing work remains readable/editable after cancellation or past-due state, but creation of new projects is denied. Project archiving/active-only counting is not implemented. Storage, pages, users and PDF usage are not yet subscription-metered.

`src/lib/billing.ts` and the billing migration contain the plan mapping. When changing limits, add a migration and update the code/UI together. Checkout uses a database reservation and stable Stripe idempotency key, with a 60-minute session and five-minute expiration grace. A different plan cannot start an overlapping session; finish the original checkout or wait for expiration. Verify these behaviors against Stripe test mode. Before public sales, complete repeat-trial abuse controls, canceled-account resubscription and periodic reconciliation. A canceled subscription currently routes through the existing billing portal instead of opening a fresh checkout automatically.

### Switching to live

Only after launch gates pass: complete Stripe business identity and bank payout verification; approve refund/cancellation/proration policy; create live products/prices; configure live portal/webhook; replace the test keys and price IDs in **production only**; verify webhook delivery and controlled customer onboarding. Live and test identifiers are different. Do not perform a real charge without owner authorization.

Automatic sales-tax collection/compliance is **not implemented**. Estimate tax allowances and taxes on SaaS subscriptions are different questions. Obtain qualified advice on registrations, taxable services, invoicing, geography, records and returns before selling. Annual plans and overages are not implemented.

## F. Email and customer communications

Supabase manages signup confirmation templates. The app has no custom transactional email provider and no automated invitation/RFQ emails. Owner/admin users can generate a one-use invitation code, share it privately, and the invitee accepts it while signed into the exact confirmed email address. Code expiry is seven days. No message is sent by clicking Create invitation code.

For real email, choose an owner-controlled SMTP sender. Verify its domain using the provider's exact SPF/DKIM records; configure DMARC with your email administrator. Set SMTP host, port, credentials and sender identity in Supabase Auth. A proposed sender such as `accounts@blueprintbid.com` and reply-to such as `support@blueprintbid.com` must be created and monitored before use; these mailboxes do not exist merely because this guide names them.

Test signup confirmation from a non-team email, inbox/spam placement, link destination, expiry and reply handling. Supabase's built-in sender is restricted and unsuitable as assumed general customer email. See [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp). Password recovery is implemented: enter your email on Sign in and choose Send password reset email. Allow the exact `/auth/callback` URL in Supabase redirect settings, open the recovery email in the same browser, then set and confirm a new password. The callback accepts only a PKCE code and redirects to the fixed password page. Verify real delivery, expiry, cross-browser failure and re-login before launch. Stripe billing notices/receipts must be enabled and tested in Stripe settings; the app does not send substitutes.

Rotate SMTP credentials at the sender, update Supabase and retest. Never log message bodies or invitation tokens in support tooling.

## G. AI and document-processing setup

Native text extraction uses local PDF.js and needs no paid provider. Upload PDF, PNG or JPEG, maximum 20 MiB; native extraction maximum 100 pages. Visual analysis uses the configured OpenAI model to interpret one selected PDF page or image, including scanned content. It proposes quantities, dimensions, materials, finishes and hardware with evidence and uncertainty. This is not validated human-equivalent accuracy. Encrypted or malformed PDFs can fail.

Run `npm run seed:fixture`, create a hosted test project and upload the generated PDF. Inventory must first show uploaded/not processed. Click Extract native text. Expect a page-1 candidate and a blank-page OCR warning. Create a scope candidate, open the original source PDF, verify evidence, enter quantities/components and confirm responsibility manually. Paste-page-text review is also available in the demo.

Native processing records track provider, template version, pages, latency and zero external provider cost. Visual processing records track model, prompt version, response ID, token usage and evidence; monetary cost remains unknown rather than being reported as zero. Hosting compute and storage still cost resources. A failed request can be retried; a stale Processing lease expires after two minutes. No automatic paid fallback or fake success is used. Read [docs/document-processing.md](docs/document-processing.md) for visual setup and evaluation. Malware scanning, durable workers, broader tenant usage budgets and accuracy evaluation are required before arbitrary customer documents.

## H. Production deployment

Use [docs/deployment.md](docs/deployment.md) for the ordered runbook. No deployment is currently verified. The build command is `npm run build`; the start command is `npm run start`; health endpoint is `/api/health`. Public configuration must be present at build time; private credentials only at runtime. The Dockerfile runs as a non-root user.

Configure private storage through migrations, HTTPS/reverse proxy, correct origin, rate limiting, secret storage, logging redaction and staging isolation. No separate worker exists yet. Do not select a platform with an upload-body cap below the implemented 20 MiB without changing the architecture. Health reports liveness and configured-variable presence, not a verified integration connection.

For updates, keep an immutable previous release, apply additive migrations, verify staging and then switch production traffic. Roll back the application image if needed. Do not discard customer data through reverse migrations. Back up before schema changes and plan Stripe reconciliation after database restore.

## I. Security and privacy checklist

- [ ] Secrets stored outside Git; public Supabase key and server administrative key correctly separated.
- [ ] Real Supabase tenant isolation and private-object download tests passed.
- [x] Project aggregate shape, numeric values and issued proposal generation enforced in PostgreSQL and tested locally.
- [ ] Hosted grants and auxiliary write boundaries reviewed with real Supabase clients.
- [ ] Malware quarantine, isolated worker and distributed rate limits deployed.
- [ ] Owner/admin access protected with MFA; invitation/member lifecycle reviewed.
- [ ] Logs exclude document content, authorization, cookies and payment secrets.
- [ ] Database **and object-byte** backups configured and restored successfully in staging.
- [ ] Account export/deletion and retention policy implemented and tested.
- [ ] Support/security reporting channel monitored; incident procedure rehearsed.
- [ ] Dependency checks, compatible lint upgrade and independent security review completed.

Detailed controls and remaining gaps: [SECURITY.md](SECURITY.md), [docs/threat-model.md](docs/threat-model.md). No certification or production-security assurance is claimed.

## J. Legal and business checklist

This is operational information, not legal or tax advice. The owner and qualified advisers must complete:

- [ ] Business entity, bank account, Stripe identity/payout requirements and bookkeeping.
- [ ] Terms, privacy, acceptable use and data-processing/subprocessor disclosures.
- [ ] Document-upload authorization/copyright representations and AI/estimate limitations.
- [ ] Refund, cancellation, trial, failed-payment and tax policies.
- [ ] Retention, deletion, data access, security notifications and applicable privacy rights.
- [ ] Appropriate insurance review.
- [ ] Monitored support contact, customer onboarding and escalation process.

The `/terms` and `/privacy` pages explicitly identify themselves as incomplete drafts. They are not ready to serve as customer agreements.

## K. Launch sequence

Follow [docs/launch-checklist.md](docs/launch-checklist.md) from staging through the first paying customer. Do not skip signup/email, real tenant isolation, upload/processing, proposal privacy, Stripe cancellation, backup restore, support inbox and monitoring. Record actual evidence for each check. No production item is checked merely because code exists.

## L. Routine operation

Owners/admins can review Organization access in the hosted project list and remove permitted members with confirmation. Removal immediately revokes organization RLS access and expires outstanding invitations; owner removal and self-removal are blocked. Read [docs/operations.md](docs/operations.md). Daily, review failed documents and webhook deliveries; watch storage and compute usage. Help customers using verified membership and safe identifiers, not unrestricted service-role browsing. Update prices by creating new Stripe prices and mapping them deliberately; existing subscriptions do not magically adopt new prices. Change entitlements through reviewed code and migrations. Review dependencies regularly and rerun the full relevant suite.

Back up database and storage separately, test restoration, keep the previous deployable image and log rollout/rollback dates. No automated retention/deletion job or periodic billing reconciliation worker currently runs. Those require implementation and an approved policy.

## M. Troubleshooting

| Symptom                                             | Checks                                                                             | Resolution                                                                                                             |
| --------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `npm`/Node missing or wrong version                 | `node --version`, `npm --version`                                                  | Install/select Node 24, then `npm ci`                                                                                  |
| Install fails with network/DNS errors               | Registry reachability, Codespace network, proxy policy                             | Restore allowed registry access; do not disable TLS verification                                                       |
| Hosted accounts not configured                      | Both public Supabase variables; restart/build timestamp                            | Set project URL and publishable key, restart or rebuild                                                                |
| Signup email missing                                | Supabase Auth log, email confirmation settings, SMTP status, spam                  | Configure custom SMTP for non-team users; verify sender and URL                                                        |
| Cannot sign in after confirmation                   | Confirm exact email/password and user confirmation in Auth                         | Use sign-in after confirmation; request recovery from Sign in; verify SMTP and the exact `/auth/callback` redirect URL |
| Organization/project creation fails                 | Migrations, authenticated membership, role, project quota                          | Apply missing migration, confirm role, check subscription/limit; do not bypass RLS                                     |
| Save fails after another editor saves               | Current project revision versus stored revision                                    | Export your internal work, reload latest version and reconcile edits manually                                          |
| Save/upload/PDF rejected in Codespace               | Browser origin versus NEXT_PUBLIC_APP_URL                                          | Set the exact forwarded HTTPS origin and restart/rebuild                                                               |
| Upload rejected                                     | PDF extension/MIME/signature, 20 MiB limit, editor role, private bucket            | Use a valid smaller PDF and correct permissions; inspect safe server logs                                              |
| Source download unavailable                         | Session, document row, path, bucket policies                                       | Reauthenticate and verify same-tenant metadata/object existence                                                        |
| No text candidates / OCR warning                    | Is PDF scanned? Does the page actually contain selectable text?                    | Use configured visual analysis or review the original manually; never accept blank output as complete scope            |
| Processing stuck / failed                           | Wait two minutes for lease, check 100-page limit and encrypted/malformed file      | Retry or split PDF; repeated failures need investigation, not repeated paid processing                                 |
| Incorrect total                                     | Per-scope quantities, duplicate operations, waste, markup versus margin, tax basis | Reconcile components and formulas in docs/estimating-model.md                                                          |
| Proposal cannot issue                               | Review warnings, unknown responsibility, missing costs/terms, unresolved risks     | Confirm scope and document risk resolution; do not remove checks                                                       |
| PDF missing symbols                                 | Standard PDF font is ASCII                                                         | Use plain text for evaluation; Unicode font support remains required                                                   |
| Stripe checkout unavailable                         | Owner/admin role, test key, price IDs, existing subscription                       | Correct test setup; use portal for an existing subscription                                                            |
| Paid access not reflected                           | Signed webhook deliveries, endpoint secret, service key, price mapping             | Repair configuration and retry signed delivery; redirect alone grants no access                                        |
| Webhook 400 / 500                                   | Signature/raw body (400), configuration/database/current Stripe state (500)        | Use the correct endpoint secret; inspect Stripe delivery details and retry                                             |
| DNS/SSL not ready                                   | Host verification, actual A/CNAME/TXT, TTL, certificate status                     | Correct only host-specified records; wait for caches; preserve existing mail records                                   |
| Browser tests fail before launch                    | Missing Chromium or shared libraries                                               | `npx playwright install --with-deps chromium`                                                                          |
| Build TypeScript child output fails only in sandbox | Compare `npm run typecheck` and build in permitted environment                     | Run the build outside that restricted sandbox; keep type checks enabled                                                |
| Lint crashes with getFilename                       | ESLint 10 versus bundled Next React plugin                                         | Use locked compatible ESLint 9 temporarily; track upgrade in ADR 0002                                                  |
| Demo state will not load                            | Browser storage invalid/full, schema validation                                    | Preserve raw storage/export if possible; clear only synthetic demo site data to reseed                                 |
| Deployment health is 200 but hosted features fail   | Health is liveness only                                                            | Verify Supabase, Stripe, SMTP and storage separately                                                                   |

## Files to return to

- [Living plan](docs/implementation-plan.md)
- [Owner actions and engineering gates](docs/owner-decisions.md)
- [Architecture](docs/architecture.md) and [data model](docs/data-model.md)
- [Estimating formulas](docs/estimating-model.md)
- [Document processing](docs/document-processing.md)
- [Deployment](docs/deployment.md), [operations](docs/operations.md), [launch checklist](docs/launch-checklist.md)
- [Validation report](docs/validation.md)

### Visual analysis activation and evaluation

Apply migration 009 before enabling visual analysis. The hosted Documents panel requires explicit consent before sending each selected page/image to OpenAI for paid processing. The server caps reservations at 25 visual calls per organization per UTC day; failed calls consume a reservation. This is a request cap, not a dollar spending cap. Set provider-side spending controls. `store: false` is sent, but does not promise zero provider retention; approve customer-document processing terms before production.

Candidates remain Needs review with unknown responsibility and no price components. An estimator must verify evidence and quantities against the source before confirmation. Single-page analysis cannot establish complete project scope or deduplicate across sheets. Whole-set orchestration, source-region overlays and calibrated accuracy remain unfinished.

Offline visual contract tests cover page isolation, structured output, provenance, unsupported quantities and failure handling. They do not measure recognition accuracy. Owner action: run an authorized paid staging evaluation using consented plans/images and independently labeled scope, counts, dimensions and materials; record omissions, false positives, quantity error, latency and actual cost before claiming production accuracy.
