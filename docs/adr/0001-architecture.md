# ADR 0001 — manual-first Next.js and Supabase foundation

Accepted 2026-09-09. Use Next.js App Router with TypeScript, decimal.js for deterministic money, Supabase Auth/Postgres/private Storage for hosted persistence and tenant isolation, and pdf-lib for server-rendered PDFs. Use ordinary accessible HTML controls and CSS initially rather than adding a component framework before a reusable design system exists. Core calculation and customer-projection functions are independent of UI and providers.

A separately labeled browser-local synthetic demo allows credential-free evaluation. It is not authenticated multi-tenant SaaS and must not receive customer documents. Hosted operations fail closed without configuration. Estimates retain input snapshots so template changes do not reprice issued proposals. External verification is a launch gate.
