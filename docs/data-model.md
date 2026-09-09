# Data model

Migrations apply in filename order. Hosted Supabase supplies `auth.users`, `auth.uid()`, Storage tables and roles. The test bootstrap supplies minimal equivalents only for Postgres tests.

| Table | Purpose and protection |
|---|---|
| organizations | Business identity; member-only reads; created with an atomic owner-membership RPC |
| memberships | Composite organization/user key; role lookup through narrowly scoped security-definer function; no direct user writes |
| projects | Organization FK, JSONB validated aggregate, revision counter; immutable identity, optimistic concurrency, issued-snapshot protection, audited writes |
| documents | Composite organization/project FK, immutable storage path shape, metadata, processing state and candidate result |
| processing_runs | Provider/version, pages, latency and cost history; document/project relationship checked on insert |
| catalogs | Company material/hardware/labor/finish/settings schema foundation; assembly UI writes append-only versions |
| audit_events | Server-generated project and invitation events; owner/admin reads, no application update/delete grants |
| invitations | Email-bound, hashed, expiring, single-use tokens; confirmed email and owner/admin authorization enforced in RPCs |
| subscriptions | Stripe customer/subscription, plan, status and last event time; verified webhook service writes only |
| billing_events | Event ID primary key; atomic idempotency with subscription updates |

Every application table enables RLS. Storage bucket `bid-documents` is private. Object paths are organization/project/random-document-id.pdf. Read policies require a matching visible document record; insertion requires editor access to the path's project. Metadata uses a composite FK to prevent a tenant from attaching a document to another tenant's project.

Project aggregate includes room-based scope, component snapshots, review/evidence, pricing, logistics, commercial items, vendor quotes, structured risks, qualifications, local edit deltas and customer snapshots. Server audit preserves full before/after saved aggregates. Browser actor labels are descriptive only; the authoritative actor is the audit trigger's auth.uid(). Source evidence currently uses a text reference; structured page/entity and bounding-box tables remain a future migration.

Role behavior: owner/admin/estimator/project manager edit estimates and documents. Draftsperson/viewer are read-only in this initial permission model. Owner/admin create invitations; only owner can invite an administrator. Owner/admin member directory and guarded revocation are implemented, including outstanding invitation expiry and audit. Owner transfer and organization deletion UI remain unimplemented. Never manipulate memberships through a public service-key endpoint.

Deletion/export policy must be approved before production. Demo/internal project JSON export is implemented. Full organization export, document export manifest, account deletion and retention jobs remain owner-gated development work. Audit retention needs a defined policy, not casual SQL deletion.

`project_shape()` embeds the generated Zod JSON schema. `matches_project_shape` implements only its tested finite keyword subset. `a_validate_project` enforces shape, size, IDs and numeric bounds; `b_issue_snapshot` enforces review gates and calculates customer snapshots using Postgres numeric. Update generated schema plus append a migration when the persisted contract changes. `checkout_attempts` provides stable per-organization reservation/idempotency keys; no direct client table grants are provided.
