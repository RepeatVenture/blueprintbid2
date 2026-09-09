# Owner decisions and external work

No accounts were created, paid services enabled, emails sent, DNS records changed, repository pushed or production deployment performed during this build.

## Required before hosted evaluation
- Create owner-controlled Supabase staging project, choose region, apply migrations, provide public URL/key to environment, enable email/password confirmation, configure allowed URLs.
- Decide whether to use only team-member test emails or configure custom SMTP for broader testing.
- Choose a Node/container staging host with 21 MiB request allowance and 60-second execution support. Keep staging access-restricted.
- Choose a safe private support/security reporting channel.

## Required before charging customers
- Approve Starter/Pro/Studio prices, project limits, seven-day card-required trial, cancellation access policy and trial-abuse controls.
- Create Stripe test products/prices, configure portal and signed webhook, test lifecycle. Supply production Stripe credentials only after business verification, banking and launch gates.
- Decide taxes, refunds, prorations, cancellation timing, annual plans, overages and failed-payment grace. Automated sales-tax handling is not implemented.
- Approve legal terms, privacy, acceptable use, document permissions, data-processing disclosures, AI/estimate disclaimers and insurance posture with qualified advisers.
- Choose a production host and DNS changes for blueprintbid.com, www and optional staging hostname; preserve unrelated DNS/email records.
- Configure transactional SMTP sender and support mailbox, error alerts and backup budget. Approve retention and deletion/export policy.

## Engineering launch gates (not tasks that credentials alone solve)
- Run hosted integration tests including Auth and Storage, real Stripe test webhook lifecycle, permission-negative cases and restore drill.
- Isolated durable document worker, malware quarantine, hard resource limits and distributed rate limiting.
- Verify new project aggregate validation in hosted Supabase and harden auxiliary catalog/document writes; complete transactional usage/entitlements beyond project count.
- Verify implemented password recovery and member revocation in staging; implement owner transfer, organization export/deletion and retention jobs.
- Verify checkout reservations in Stripe test mode; complete trial abuse, resubscription and reconciliation hardening.
- Calibrated extraction validation, OCR provider only when ready and budgeted; no automatic quantity accuracy is promised.
- Unicode PDF support, richer proposal branding and terms review.
- Nested dimension-based assemblies, operation-level actuals, advanced yield/nesting, source regions, schedule dependencies and mature vendor buyout workflow.

Do not confuse these engineering gaps with configured external services. Use docs/implementation-plan.md to resume development.
