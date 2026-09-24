# Document processing

Uploads accept PDF, PNG and JPEG up to 20 MiB into private tenant storage. Native PDF.js extraction finds text candidates; visual analysis uses OpenAI Responses with an explicitly configured vision model. A PDF request copies only the selected page into a new PDF. Images use high-detail image input. No model tools are enabled.

Set server-only OPENAI_API_KEY, OPENAI_VISION_MODEL and VISION_ENABLED=true after applying migration 009. Select a model supporting PDF/image input and strict structured outputs. The UI requires explicit paid-processing consent. A database reservation caps calls at 25 per organization per UTC day, including failures. This does not cap dollars. Configure provider spending limits separately.

Structured candidates include quantity basis, printed dimensions, materials, finishes, hardware, evidence and uncertainty. Unsupported quantities are cleared. Incomplete, refused and invalid responses fail without accepting candidates. Existing results survive failed retries. Source page, model, prompt version and response ID accompany imported scope. Imported candidates require estimator review and carry no automatic pricing.

Processing is synchronous with a 45-second provider timeout (120 seconds for explicitly configured GPT-5.4) and a five-minute document lease. There is no durable queue, full-set reconciliation, verified scale measurement or source-region highlighting. Model confidence is subjective. No human-equivalent accuracy claim has been established.

Requests specify store:false; this is not a zero-retention guarantee. Owner approval of provider data terms and spending is required before production customer uploads. Do not log keys or document content.

Offline tests exercise the API contract using synthetic responses, not a live model. Before launch, evaluate consented scans, vector PDFs and photographs against independently labeled cabinet counts, dimensions, finishes and hardware. Include duplicate plan/elevation representations, unreadable sheets and conflicting details. Record false positives, omissions, quantity errors and paid usage. Never treat an empty result as proof of no scope.

API references: https://developers.openai.com/api/docs/guides/file-inputs, https://developers.openai.com/api/docs/guides/images-vision, https://developers.openai.com/api/docs/guides/structured-outputs.
