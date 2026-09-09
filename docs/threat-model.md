# Threat model and launch gates

| Threat | Implemented control | Remaining verification / gap |
|---|---|---|
| Cross-tenant IDOR | RLS, verified user session, composite project/document FK, private path policies | Test real Supabase Auth JWT and Storage HTTP with two organizations |
| Privilege escalation | No direct membership write grants; owner/admin RPC checks; security-definer search_path empty | Owner transfer/removal, administrative support controls and MFA policy |
| Invitation compromise | Hashed random token, confirmed email binding, 7-day expiry, one use, atomic row lock | Owner transfer and distributed invitation limits |
| Malicious PDF | Body/type/signature/page/time limits, attachment download, no PDF actions executed by application | Antivirus quarantine and isolated worker hard resource bounds are required |
| Prompt injection | No LLM/tool execution; page text is data; validated keyword output | Review any future AI provider against adversarial fixtures |
| Exposed storage | Private bucket, authenticated controlled downloads, no static public links | Verify signed/private paths in staging, test backup access |
| Webhook spoof/replay | Raw-body signature verification, event PK, atomic RPC, serialized organization update, event-time guard | Real Stripe test deliveries and reservation behavior, resubscription, reconciliation job |
| Proposal disclosure | Customer allowlist, PDF renderer never fetches a project, immutable issued snapshots | Unicode font, actual branded output review; exported internal JSON is sensitive |
| CSRF / XSS | Exact Origin on mutations, React escaping, security headers, no raw HTML | Nonce-based CSP; current script/style CSP includes unsafe-inline for Next runtime |
| Resource exhaustion | Bounded request readers, per-process limits, PDF size/pages, claim lease | Distributed edge rate limits, storage/page/user entitlements and durable queue |
| Direct Data API malformed aggregate | RLS, generated project shape/numeric validation and authoritative SQL customer snapshots | Verify hosted grants and auxiliary catalog/document write contracts; expand parity/property tests as the model evolves |
| Secret leakage | Env-only keys, gitignore, service key only in verified webhook code, generic errors | Deployment log/redaction audit, rotation drill and secret scanning in CI |
| Lost work | Explicit save, local export, optimistic revision, append-only catalog/proposal versions | Unsaved navigation guard, collaborative editing, account export/deletion and restore drill |

No security certification, malware scanning, production restore verification or penetration test is claimed. Protect staging with access restrictions while closing these gates. Do not expose this evaluation build to arbitrary customer documents.
