# Routine operations

Do not assume an HTTP 200 health check proves the database, Stripe, SMTP, backups or DNS works. Establish separate synthetic checks for each integration in staging and production.

Daily: review failed/stale documents in inventory, Stripe webhook deliveries, rejected logins, storage growth and unexpected project creation. Processing attempts can be retried after two minutes if the Node request died. Look for repeated failures before retrying a malformed file indefinitely. No paid OCR calls exist, but hosting/storage consumption still matters.

Support: ask for organization ID, project ID, approximate time and a safe description. Do not ask users to email private plans or API keys. Verify the requester's identity/membership. Use a dedicated least-privilege support account and log access. There is no cross-tenant support dashboard. A service-role key bypasses RLS and is inappropriate for routine customer browsing.

Database owner diagnostics (private SQL Editor only):
```sql
select status,count(*) from public.documents group by status;
select provider,sum(pages),sum(estimated_cost),count(*) from public.processing_runs group by provider;
select action,count(*) from public.audit_events where created_at>now()-interval '1 day' group by action;
select status,count(*) from public.subscriptions group by status;
```
Do not paste returned customer identifiers or raw JSON into public tickets. Structured operational events include event name, time and outcome only; no content logging is enabled by the app. Infrastructure access logs must redact cookies, authorization and request bodies.

Backup: select and fund a Supabase backup/PITR policy suitable for the business. Record recovery point and recovery time objectives. Database backups are not a substitute for backing up object bytes from Storage. Store encrypted exports/manifests separately under least privilege. Monthly (or the approved frequency), restore database and objects into a separate staging project; verify project totals, proposal versions, membership policies and object checksums. Document the date, operator and elapsed time. No restore drill has been executed.

Incident: restrict traffic, preserve audit/log evidence, revoke compromised keys/tokens, identify affected tenants, assess obligations with the owner/legal contact, recover from a known good version and document the cause. Do not destroy evidence during cleanup. Service key rotation requires updating the server secret; public Supabase project-key changes require a rebuild.

Billing: inspect Stripe delivery status and request IDs before retrying; the event primary key prevents repeat processing. Replay failed signed events after fixing configuration. If an event arrives after a database restore, compare current Stripe subscriptions with local records. A scheduled reconciliation job is not implemented. Cancellation blocks new projects after the webhook; existing work remains accessible/editable under the current evaluation policy.

Changes: branch, implement, run relevant tests and production build, deploy staging, verify, then deploy an immutable release. Keep the previous image available. Re-run npm audit with lockfile updates; track the ESLint compatibility exception. Monitoring/error tracking, log alert routing and analytics are not connected to an external vendor yet. Configure a monitored support inbox and choose privacy-compatible tooling before public launch.

Member revocation is available to owners/admins in Organization access and is audited. It also expires outstanding invitations. Existing Supabase sessions remain valid for the account but lose this organization through RLS immediately. Do not delete auth users merely to remove organization membership. Password-reset links must be opened in the browser that initiated recovery so the PKCE verifier is available.
