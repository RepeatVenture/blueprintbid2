# Security

This is an evaluation build, not a production security certification. A security reporting address is not configured. Report potential vulnerabilities privately to the repository owner using GitHub private vulnerability reporting if enabled; do not post customer data or exploit credentials in public issues. Owner must enable a monitored private channel before launch.

Interactive database and storage access uses the authenticated user and RLS. The service-role key is server-only and restricted in application code to verified Stripe webhook writes. Database audit events cannot be edited by application users. Public proposal rendering is an allowlisted, stateless operation and never loads a project by a caller-supplied identifier.

See docs/threat-model.md for controls and gaps. Key launch gates: real Supabase isolation tests, malware scanning, isolated durable workers, distributed rate limits, account lifecycle controls, production backup restore, CSP hardening and independent security review.
