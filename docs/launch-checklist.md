# Launch checklist

Local tests are a starting point. Every unchecked external item requires observed evidence and a date/operator, not a statement that the configuration looks correct.

- [ ] Owner approves target market, prices, entitlements, trial, refunds and cancellation.
- [ ] Legal pages, privacy contact, acceptable use and data-processing policy approved.
- [ ] Staging host and separate Supabase project configured.
- [ ] Migrations run from empty hosted database; private bucket confirmed.
- [ ] Signup, email confirmation, login and recovery tested with a non-team email.
- [ ] Organization creation and email-bound invitation flow tested.
- [ ] Viewer/editor/admin roles verified with real JWT requests.
- [ ] Tenant A cannot read/write tenant B projects, catalogs, documents or object bytes.
- [ ] Native PDF fixture uploads, processes, cites correct page and reports blank/scanned page honestly.
- [ ] Malicious PDF quarantine and worker resource limits deployed.
- [ ] Failed-job retry and alert tested.
- [ ] Estimate quantities, tax assumptions, markup and margin independently reviewed by owner.
- [ ] Save/reopen, conflicting saves, issue/revise, customer-safe PDF and internal handoff verified.
- [ ] Stripe test prices, seven-day card-required trial and portal configured.
- [ ] Signed subscription events, retries, duplicate deliveries and failure states verified.
- [ ] Plan limits, upgrades/downgrades, concurrent checkout and resubscription verified.
- [ ] Cancellation and past-due policy verified without losing customer data.
- [ ] Production backup and object restore completed in isolated staging.
- [ ] Support inbox, private security contact, monitoring and incident contacts tested.
- [ ] Account export/deletion, retention, membership revocation and access review implemented.
- [ ] Independent security review; hosted aggregate and auxiliary write validation verified.
- [ ] Production DNS, HTTPS, www redirect and authentication URLs verified.
- [ ] Live Stripe business verification, payout bank and tax decisions complete.
- [ ] Privacy-compatible analytics/consent decision recorded; no hidden tracking.
- [ ] First paying customer completes onboarding, upload, estimate, proposal and support contact.
