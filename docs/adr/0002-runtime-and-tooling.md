# ADR 0002 — explicit runtime limits and compatible tooling

Accepted 2026-09-09. Use Node 24 and a Node/container host for the initial hosted evaluation. The application accepts PDFs up to 20 MiB and runs native text extraction for at most 100 pages. Some serverless hosts impose lower body and execution limits, so do not assume their defaults support this upload route. PDF.js remains a server external package for its worker/module resolution. A separate durable worker and malware quarantine are deferred launch requirements.

Use ESLint 9.39.5 temporarily: installing ESLint 10.10.0 caused Next's bundled React plugin to fail while loading `react/display-name` (`getFilename` API mismatch). Track the compatibility upgrade before launch. Do not disable lint rules to conceal this failure. The installed dependencies reported no npm audit vulnerabilities during local verification; repeat the check on updates.

Next's TypeScript child CLI emitted unparsable output under this execution sandbox. The same production build and TypeScript validation passed outside the sandbox. Type checking remains enabled; no build error bypass was added.
