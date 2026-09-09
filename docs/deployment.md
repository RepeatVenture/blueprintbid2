# Deployment runbook

No deployment has been performed. The supported artifact is a Node 24 application or the included Dockerfile. Choose an owner-controlled container/Node host after reviewing its upload limits, cost, backups, region and privacy terms. No particular hosting account is required for local evaluation.

1. Create separate Supabase staging and production projects; never point a preview build at production.
2. Apply migrations in filename order via Supabase SQL Editor (paste each complete file and run once) or the Supabase CLI migration workflow. Do not run tests/database/bootstrap.sql on Supabase.
3. Copy environment names from .env.example into your host's encrypted environment settings. Public variables are baked into the browser build; changing them requires a rebuild. Server keys must never be build arguments.
4. Run `npm ci`, `npm run check`, then `npm run start`. The app listens on port 3000. Forward HTTPS through the host's managed reverse proxy. Do not expose an unencrypted public port 3000.
5. If using Docker, build with `docker build -t blueprintbid:staging .` for a demo-only image. For hosted builds supply NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as build arguments in the host's UI. These three are public configuration. Run with server-only secrets supplied through the host's secret store.
6. A local container preview can use `docker run --rm -p 127.0.0.1:3000:3000 --env-file .env.local blueprintbid:staging`. Never publish this file or use the local test database's trust authentication for production.
7. Configure reverse proxy request size at least 21 MiB, upstream timeout at least 60 seconds, TLS, rate limiting and request logging without bodies/cookies/query secrets. If the host does not permit these limits, implement direct signed uploads plus a worker before deployment.
8. GET /api/health must return HTTP 200. This is liveness and configuration presence only, not proof of live database/billing connectivity.
9. Verify actual signup/email, two organizations, project save/reopen, source download, extraction, PDF, invitations, subscription delivery and cancellation in staging. Complete docs/launch-checklist.md before public traffic.

Rollback: retain the previous immutable image/release and its environment configuration. Switch traffic back to that release. Database changes should be backward-compatible; do not automatically run down-migrations that discard customer data. Restore a database backup only after owner approval and a documented data-loss window. Reconcile Stripe state after any restore. Storage objects require a separate backup/restore process.

There is no separately runnable worker yet. Native processing runs in the Node API process, with retry leases and bounded pages. For production, introduce an isolated durable queue, malware scanning, transactional usage, and dead-letter handling before accepting arbitrary customer plan sets.

The Dockerfile was built locally; selected-host deployment remains unverified. It copies the runtime Next configuration as JavaScript so production startup does not require a TypeScript development dependency. Record host-specific upload, timeout and health verification before deployment. Official runtime guidance: [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting).
