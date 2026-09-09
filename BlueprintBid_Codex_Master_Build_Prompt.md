# BlueprintBid — Master Build Prompt for Codex

You are the lead product architect, senior full-stack engineer, AI/document-processing engineer, database designer, security engineer, DevOps engineer, QA engineer, UX designer, and technical writer responsible for building a fresh, production-minded version of **BlueprintBid**.

This prompt is the product charter. Read it completely before making changes. Then inspect the repository and existing environment, document what exists, form an implementation plan, and execute that plan as far as the available environment and permissions allow.

The owner is a commercial millwork estimator, project manager, draftsman, and experienced custom cabinetmaker. The product must reflect real millwork-estimating practice. Do not reduce the product to a generic construction calculator or a black-box AI demo.

The owner controls the domain **blueprintbid.com** and intends to turn this application into a revenue-producing SaaS business for small-to-medium residential and commercial millwork and cabinet shops.

## 1. Your operating mandate

Take ownership of the technical execution. Make sound, conventional decisions without repeatedly asking the owner to choose between minor implementation details. You are authorized to create and modify the application code, database migrations, tests, configuration examples, seed data, documentation, scripts, and local development tooling needed to produce a working system.

Use judgment, but follow these constraints:

- Do not invent credentials, API keys, connection strings, customer data, vendor agreements, or completed account setups.
- Do not commit secrets to Git.
- Do not silently sign up for paid services or cause billable usage.
- Do not claim that DNS, email, payment processing, storage, AI providers, tax services, or production deployment are configured unless they were actually verified.
- When an external account, credential, legal decision, payment, DNS change, or owner authorization is required, continue all work that can be completed safely and record the blocked action in the owner README.
- Prefer maintained, well-documented technologies and avoid unnecessary complexity.
- Make the codebase understandable to a future developer.
- Build vertical slices that work end-to-end instead of producing a large collection of disconnected placeholders.
- Do not mask unfinished core functions with fake success states.
- Any mock or demo behavior must be clearly labeled and replaceable.
- Preserve an audit trail for AI-extracted facts, human edits, pricing changes, and generated documents.
- Treat uploaded construction documents and customer pricing as sensitive business information.
- Optimize for correctness, traceability, and estimator control before attempting fully automatic estimating.

Before implementation, create or update a living plan in the repository. Work in phases, validate each phase, and revise the plan as new information is discovered.

## 2. Product definition

BlueprintBid is a multi-tenant SaaS platform that helps millwork and cabinet shops turn construction documents into a reviewable scope, detailed estimate, logistics plan, schedule, and professional proposal.

The initial target customers are small-to-medium residential and commercial millwork, architectural woodwork, custom cabinetry, casework, and related fabrication shops. These companies often rely on owners or senior employees to review drawings manually, maintain inconsistent spreadsheets, request vendor prices, estimate labor from experience, and assemble proposals under tight deadlines.

BlueprintBid should make that workflow faster and more consistent while keeping the human estimator in control.

The core promise is:

> Upload the bid documents, identify and verify the millwork scope, build a transparent estimate from company-specific costs and production logic, account for project risk and logistics, and generate a professional proposal with an auditable record of how every number was produced.

BlueprintBid is not merely a PDF summarizer. It is also not a system that produces an unexplained total. Every extracted item, assumption, quantity, cost, labor allowance, markup, exclusion, and risk must be reviewable and overridable.

## 3. What a millwork estimator does

A millwork estimator converts architectural intent into a realistic, buildable, and financially responsible price for engineering, manufacturing, finishing, delivering, and installing custom architectural woodwork.

The estimator must answer:

1. What is included in the project?
2. Where is each scope item shown or specified?
3. How should each item be constructed?
4. What raw materials, purchased items, labor operations, and subcontractors are required?
5. What field coordination, delivery, installation, and schedule constraints apply?
6. What information is missing or contradictory?
7. What assumptions, qualifications, exclusions, allowances, and alternates are needed?
8. What will the work cost the company?
9. What selling price covers overhead, risk, and profit?
10. Can the company perform the work successfully within the required schedule?

A skilled estimator combines the thinking of a quantity surveyor, cabinetmaker, draftsman, purchaser, production planner, project manager, installer, contract reviewer, and risk analyst.

BlueprintBid must support that complete thought process.

## 4. Documents and information the system must handle

Users must be able to create a project and upload one or more documents, including:

- Architectural drawing PDFs
- Interior-design drawing PDFs
- Specification manuals
- Addenda
- Bid instructions
- Scope sheets
- Finish schedules
- Door and hardware schedules
- Equipment information
- Logistics and phasing plans
- Vendor quotations
- Supplemental sketches
- RFI responses
- Revised drawings

The system should retain document version, upload date, drawing issue date when known, addendum number, document category, processing status, and who uploaded it.

The document workspace should support page thumbnails, page labels, document search, processing status, and source citations that take the estimator back to the page where information was found. Design the data model so bounding boxes or highlighted source regions can be supported, even if exact visual-region extraction is introduced after the first working release.

The analysis pipeline should look for:

- Drawing index information
- Sheet numbers and titles
- Room names and numbers
- Floor and area references
- Interior elevations
- Section and detail references
- Millwork tags and keynotes
- Finish tags
- Cabinet and casework designations
- Countertops
- Wall panels
- Decorative trim
- Banquettes and benches
- Reception desks and nurse stations
- Bars and service counters
- Display cases and museum fixtures
- Closets and shelving
- Equipment integrated into millwork
- ADA conditions
- Hardware requirements
- Material and finish requirements
- Quality standards
- Submittal and mockup requirements
- Installation requirements
- Alternates and allowances
- Scope responsibility language
- Schedule and phasing constraints
- Potential conflicts between plans, elevations, details, schedules, and specifications

## 5. Required product philosophy: evidence before automation

Every AI-derived assertion should be evidence-backed.

For each extracted scope item or requirement, store as much of the following as practical:

- Source document
- Source version
- Page or sheet
- Drawing/detail/elevation reference
- Source text or extracted evidence
- Extraction method or model
- Confidence level
- Processing timestamp
- Whether it was accepted, modified, rejected, or manually created
- User responsible for the decision
- Prior values when edited

Never present uncertain extraction as unquestioned truth. Use statuses such as:

- Needs review
- Confirmed
- Missing information
- Conflict detected
- Assumption required
- Excluded
- Superseded

The interface should help the estimator focus first on low-confidence, high-cost, and high-risk items.

## 6. Primary user workflow

Implement a clear project workflow with persistent status:

1. Create project
2. Enter client, bidder, location, due date, tax status, wage requirements, schedule, and general information
3. Upload drawings, specifications, and addenda
4. Process documents
5. Review document inventory and processing errors
6. Review automatically detected rooms, sheets, finishes, specifications, and scope candidates
7. Resolve duplicates and document conflicts
8. Confirm the scope of work
9. Convert scope items into estimate assemblies
10. Add or select construction methods, materials, hardware, finishes, and labor operations
11. Review quantities and source citations
12. Request or enter vendor quotations
13. Estimate shop drawings, field dimensions, project management, fabrication, finishing, delivery, and installation
14. Review project logistics and schedule
15. Record assumptions, exclusions, allowances, alternates, and RFIs
16. Review costs, overhead recovery, contingency, markup, margin, and selling price
17. Run estimate validation checks
18. Lock or issue an estimate version
19. Generate a customer proposal PDF
20. Generate an internal handoff package if awarded
21. Track revisions and change orders
22. Compare estimated performance with actual costs when data becomes available

The user should always be able to save progress and return later.

## 7. Scope-of-work system

Scope must be organized by project, floor, area, room, elevation, assembly, and source document as appropriate.

Support common scope categories including:

- Base, wall, tall, and specialty cabinets
- Frameless and face-frame cabinetry
- Vanities
- Kitchen and pantry cabinetry
- Reception desks
- Nurse stations
- Transaction counters
- Bars
- Banquettes and built-in seating
- Conference-room credenzas
- Copy-room and mailroom cabinetry
- Laboratory and institutional casework
- Library shelving
- Retail fixtures
- Museum displays
- Display cases
- Closet systems
- Wood wall panels
- Slatted and acoustic wood walls
- Column wraps
- Ceiling panels
- Window stools and aprons
- Decorative trim and running trim
- Doors and frames when included
- Decorative screens
- Equipment enclosures
- Access panels
- Solid-surface work
- Plastic-laminate countertops
- Wood countertops
- Stone, glass, metal, lighting, and upholstery coordination

Each scope item should support:

- Unique item number
- Description
- Quantity and unit
- Floor, area, room, and elevation
- Dimensions
- Construction type
- Material and finish selections
- Hardware selections
- Accessibility designation
- Source references
- Responsibility assignment
- Inclusion status
- Confidence/review status
- Estimator notes
- Internal production notes
- Customer-facing proposal description
- Cost and selling-price linkage

Provide bulk editing, duplication, room-to-room copying, filters, sorting, and CSV import/export where appropriate.

## 8. Scope boundaries and responsibility matrix

The system must help answer who furnishes, installs, connects, templates, finishes, or coordinates related work.

Support responsibility tracking for:

- Countertops
- Sinks and faucets
- Plumbing connections
- Appliances and owner-furnished equipment
- Electrical devices
- LED lighting and drivers
- Glass
- Metal fabrication
- Structural supports
- In-wall blocking
- Upholstery
- Signage
- Stone templates
- Final caulking
- Wall repair
- Firestopping
- Touch-up
- Demolition
- Protection

Allow responsibilities such as included by us, furnished by us/installed by others, furnished by others/installed by us, coordinated only, excluded, allowance, and unknown.

Generate warnings when an important responsibility remains unknown before proposal issuance.

## 9. Specification and compliance review

The specification workspace should identify and allow confirmation of:

- Relevant CSI sections, especially architectural woodwork, casework, paneling, finish carpentry, countertops, solid surface, and related specialties
- AWI/AWS or other referenced standards
- Economy, custom, or premium grade
- QCP or certification requirements
- FSC requirements
- Formaldehyde and environmental restrictions
- Fire-retardant or moisture-resistant materials
- Core requirements
- Veneer species, cut, matching, sequencing, and grain direction
- Laminate manufacturer, pattern, finish, and substrate
- Finish system, color, sheen, samples, and mockups
- Hardware manufacturers and performance requirements
- Cabinet construction requirements
- Drawer construction
- Edge requirements
- Submittals
- Testing
- Warranty
- Installation tolerances
- Protection and closeout requirements

Distinguish document evidence from estimator assumptions. Conflicting specification and drawing requirements should create a review issue, not be silently resolved.

## 10. Estimating engine

Create a transparent, configurable estimating engine. Do not hard-code a single shop’s prices into business logic.

Each tenant must be able to configure company-specific:

- Materials and purchase units
- Sheet sizes and costs
- Lumber costs
- Waste/yield rules
- Hardware catalog and pricing
- Finish materials and coverage
- Labor departments
- Wage, burdened cost, and billing rates
- Machine rates
- Standard production times
- Subcontractor rates
- Delivery vehicles and costs
- Installation rates
- Overhead recovery
- Tax rules or taxable categories
- Default contingencies
- Markup and target margin
- Proposal terms
- Standard inclusions and exclusions

Estimate lines should preserve quantity, unit, unit cost, labor hours, labor rate, waste, cost extension, markup, sell extension, origin, and override history.

Support costs for:

- Direct material
- Purchased hardware
- Purchased components
- Subcontractors
- Engineering and shop drawings
- Field measuring
- Project management
- CNC programming
- Panel processing
- Machining
- Edgebanding
- Bench fabrication
- Veneering
- Solid-lumber milling
- Assembly
- Sanding
- Finishing
- Hardware installation
- Quality control
- Packing
- Freight
- Delivery
- Unloading and distribution
- Field installation
- Supervision
- Scribing
- Touch-up
- Punch-list work
- Equipment rental
- Travel, parking, tolls, and permits
- Bonds and project-specific insurance
- Taxes
- Overhead
- Contingency
- Profit

Clearly distinguish markup from gross margin. Show the formulas and prevent accidental confusion.

At minimum:

- Selling price from markup = cost × (1 + markup rate)
- Selling price from target margin = cost ÷ (1 − margin rate)
- Gross profit = selling price − estimated cost
- Gross margin = gross profit ÷ selling price

All calculations involving currency should use appropriate fixed-precision decimal handling, not unsafe floating-point shortcuts.

## 11. Assemblies and reusable pricing logic

Build a reusable assembly system so shops can price common items consistently while retaining full control.

Examples:

- One-door base cabinet
- Two-door base cabinet
- Drawer-over-door base cabinet
- Three-drawer base cabinet
- Sink base
- ADA sink base
- Wall cabinet
- Tall pantry cabinet
- Open shelving
- Finished end panel
- Filler and scribe
- Plastic-laminate countertop
- Solid-surface countertop
- Wood wall panel per square foot
- Slatted wall per square foot
- Baseboard or trim per linear foot
- Custom reception desk assembly

Assemblies should be versioned and capable of containing nested components, formulas, material parts, hardware, labor operations, finishing calculations, waste, setup time, minimum charges, width/height/depth variables, complexity factors, and quantity efficiencies.

Allow an estimator to inspect the component breakdown and override a project-specific instance without altering the company template.

Do not rely solely on price per linear foot. Linear-foot or square-foot pricing can be offered as an early-budget method, but detailed assemblies are required for reliable production estimates.

## 12. Materials, yield, and takeoff

Support materials including plywood, particleboard, MDF, moisture-resistant MDF, fire-retardant panels, melamine, TFL, HPL, compact laminate, veneer, lumber, solid surface, glass, metal, acrylic, edgebanding, adhesives, fasteners, and coatings.

Material records should support:

- Vendor and manufacturer
- Product and description
- SKU
- Thickness
- Sheet or stock dimensions
- Purchase unit
- Package quantity
- Base cost
- Freight or surcharge
- Effective date
- Lead time
- Minimum order
- Taxability
- Waste rule
- Alternate products
- Active/inactive status

Yield calculations should account for sheet size, part size, quantity, grain direction, saw/CNC spacing, matching constraints, waste, defects, and minimum purchasing quantities. The MVP may use practical deterministic calculations, but structure the service so more advanced nesting can be added later.

Solid-lumber calculations must distinguish finished volume from rough purchasing requirements and account for milling and selection loss.

Finish calculations should be based on actual finishable surfaces where possible, including faces, backs, interiors, shelves, edges, and multiple coats—not merely nominal cabinet frontage.

## 13. Hardware

Support hinges, slides, locks, pulls, catches, shelf supports, levelers, casters, grommets, cable management, waste pullouts, file systems, sliding/pocket-door hardware, lift mechanisms, supports, and specialty hardware.

Hardware pricing must include more than purchase cost. Allow linked machining, drilling, installation, setup, and accessory labor. Track load capacity, extension, finish, handing, quantity rules, manufacturer, model, lead time, and alternates.

## 14. Labor system

Labor must be configurable and operation-based.

Support:

- Wage rate
- Payroll burden
- Fully burdened internal cost
- Billing/shop rate
- Overtime multiplier
- Union or prevailing-wage rate
- Crew type
- Setup time
- Unit production time
- Quantity efficiency
- Complexity factor
- Minimum charge

Provide complexity levels that can be configured by the tenant. Seed reasonable examples such as simple, typical, complex, and highly custom, but label seed values as examples rather than industry truth.

Historical actuals should eventually improve suggested labor allowances. Do not automatically change a company’s production standards without review.

## 15. Shop drawings, field dimensions, and project management

Estimate these as explicit cost areas.

Shop-drawing logic may consider:

- Number of rooms
- Number of plans and elevations
- Simple, typical, complex, and custom conditions
- Repetition
- Integrated equipment
- Paneling
- Curved work
- BIM requirements
- Coordination intensity
- Expected revision exposure
- Submittal requirements

Field-dimension logic may consider site distance, number of trips, room count, templating, availability of finished conditions, and schedule risk.

Project-management logic may consider contract value, duration, complexity, meetings, submittals, procurement, phased deliveries, trade coordination, change orders, billing, punch list, and closeout.

Users must be able to use calculated suggestions, manually enter hours, or combine base allowances with item-driven additions.

## 16. Finishing

Support paint, stain, dye, toner, glaze, clear finish, conversion varnish, catalyzed lacquer, waterborne systems, polyurethane, high-gloss, metallic, distressing, and custom systems.

Allow finish systems to define preparation, sanding, sealing, priming, coats, intercoat sanding, coverage, waste, pot-life loss, material cost, spray labor, handling labor, racking constraints, curing, samples, mockups, and touch-up.

Track whether interiors, exteriors, both sides, backs, and edges are finished.

## 17. Logistics and delivery

Include a logistics planner capable of comparing company delivery against outside movers or freight.

Capture:

- Project address
- Distance and estimated drive time
- Vehicle type and capacity
- Number of trips
- Fuel, tolls, parking, permits, and driver labor
- Packaging and crating
- Loading and unloading labor
- Dock requirements
- Delivery windows
- Elevator reservations and dimensions
- Street restrictions
- Stair carries
- Hoisting
- Cart and pallet-jack access
- Storage
- Floor-by-floor distribution
- Multiple mobilizations
- Night/weekend requirements
- Occupied-building restrictions

Flag assemblies whose dimensions may exceed a stated door, elevator, or route limitation.

## 18. Installation

Installation estimates should consider crew size, burdened rate, productive hours, mobilization, layout, scribing, attachment, material handling, daily setup and cleanup, protection, security check-in, safety meetings, elevator delays, phasing, occupied-space restrictions, travel, supervision, punch work, and return trips.

Allow either detailed activity-based estimating or clearly labeled budget-level methods. Installation should never be hidden as an unexplained percentage.

## 19. Risk, clarifications, RFIs, alternates, and allowances

Create a risk register with likelihood, impact, cost exposure, owner, resolution, status, source, and treatment.

Common risks include incomplete drawings, drawing/specification conflicts, undefined finishes, unselected hardware, long-lead materials, price volatility, field dimensions unavailable, aggressive schedule, phased installation, occupied-site work, curved or prototype work, high-gloss finishes, custom veneer matching, premium tolerances, prevailing wage, bonds, retainage, and liquidated damages.

Risk treatments should include clarification, RFI, assumption, qualification, exclusion, allowance, contingency, firm quote, alternate, or bid/no-bid decision.

Provide:

- RFI log
- Clarification log
- Assumption log
- Inclusion/exclusion list
- Allowances
- Add and deduct alternates
- Unit prices
- Bid-validation warnings

## 20. Vendor quotation and buyout support

Allow users to create quote requests and record vendor responses for veneer, stone, glass, metal, upholstery, specialty hardware, lighting, acoustic products, outsourced CNC, custom finishing, freight, installation, or other subcontracted work.

Vendor quotes should track scope, quantity, included/excluded items, freight, tax, expiration, lead time, attachment, contact, and quote version.

Provide a comparison or bid-leveling view so a low quote that omits delivery or installation is not treated as equivalent to a complete quote.

For the first production release, sending RFQs automatically may be deferred. The data model and UI should still support generating or copying a complete RFQ package.

## 21. Proposal generation

Generate a polished, branded PDF proposal and an HTML preview.

Proposal configuration should support:

- Company logo and contact information
- Customer and project information
- Proposal number and version
- Base bid
- Alternates
- Allowances
- Unit prices
- Scope summary
- Inclusions
- Qualifications
- Exclusions
- Schedule assumptions
- Payment terms
- Quote validity
- Tax and bond statements
- Signature/acceptance area

Do not expose internal costs, labor rates, margins, confidence scores, or private estimator notes in the customer proposal.

Store issued proposal versions immutably. A later revision should produce a new version.

## 22. Internal handoff and actual-cost feedback

When a job is marked awarded, generate an internal handoff containing:

- Accepted proposal and scope
- Estimate version
- Labor budgets by department
- Material and purchased-item budgets
- Vendor quotes
- Assumptions and exclusions
- Long-lead items
- Schedule assumptions
- Risk register
- Unresolved issues
- Alternates and allowances
- Project contacts

Design for later entry/import of actual material purchases, labor hours, subcontract costs, and change orders. Provide estimate-versus-actual reporting by cost category, room, assembly, and operation where data permits.

## 23. Accounts, roles, and tenant isolation

This is a multi-tenant system. Every business must be isolated from every other business.

Suggested roles:

- Organization owner
- Administrator
- Estimator
- Project manager
- Draftsperson
- Viewer

Implement secure authentication, organization membership, invitations, role-based permissions, and server-side authorization. Do not depend solely on hiding buttons in the browser.

Use database-level tenant protection, such as PostgreSQL row-level security when using Supabase. Write automated tests specifically attempting cross-tenant access.

Support account deletion/export workflows and retention policies in a production-minded way, while documenting any legal policy decisions the owner must make.

## 24. Suggested technology and architecture

Use the existing repository intelligently. If it is a new or incomplete project, the preferred architecture is:

- Next.js with TypeScript
- Current stable React supported by the selected Next.js version
- Tailwind CSS
- A maintained accessible component system such as shadcn/ui
- PostgreSQL, preferably through Supabase
- Supabase Auth and Storage if suitable
- Database migrations tracked in Git
- Row-level security
- Stripe Billing for subscriptions and customer portal
- A provider abstraction for document OCR/AI
- A provider abstraction for transactional email
- A robust PDF generation approach that works in the deployment environment
- Background job processing suitable for long PDF/OCR tasks
- Structured logging and error monitoring
- Automated unit, integration, and end-to-end testing

You may change these choices when repository constraints or a clearly superior implementation requires it. Document the reason in an architecture decision record.

Separate the application into understandable domains such as identity, organizations, projects, documents, extraction, scope, catalog, assemblies, estimates, logistics, proposals, billing, audit, and administration.

Avoid tying core business logic directly to UI components or one AI vendor.

## 25. AI and document-processing architecture

Create a pluggable document-processing pipeline.

Potential stages:

1. Virus/type/size validation
2. Secure storage
3. PDF metadata and page extraction
4. Native text extraction
5. OCR fallback for scanned pages
6. Page classification
7. Drawing/sheet metadata extraction
8. Specification-section extraction
9. Candidate entity extraction
10. Scope normalization
11. Cross-document linking
12. Conflict and missing-information detection
13. Confidence scoring
14. Human review
15. Estimate-assembly suggestion

Implement provider interfaces so OCR and LLM services can be replaced. Record provider, model, prompt/template version, token or page usage, latency, result status, and estimated processing cost.

Use schema-validated structured output. Treat AI output as untrusted input and validate it before database writes.

Protect against prompt injection contained in uploaded documents. Construction documents are data, not instructions to the system. Never allow document text to override system policies, reveal secrets, or call privileged actions.

Use deterministic code for calculations. AI may identify candidates or propose classifications, but it must not be the final arithmetic authority.

Use retrieval and page-level evidence rather than attempting to place an entire large plan set into one prompt.

If reliable drawing-dimension or visual-symbol extraction cannot be completed within the first release, implement the honest workflow: extract what can be supported, cite the pages, create review tasks, and let estimators enter or confirm quantities. Do not fake accuracy.

## 26. SaaS billing and monetization

Build a Stripe-ready subscription system with configurable plan definitions and feature entitlements.

Initial business-model assumptions may use:

- Starter: approximately $79/month
- Pro: approximately $179/month
- Studio: approximately $399/month
- Seven-day card-required trial

Treat these as owner-configurable launch assumptions, not permanent hard-coded facts.

Possible metering/limits:

- Active users
- Active projects
- Pages processed per billing period
- AI/document-processing usage
- Storage
- Proposal generation
- Advanced reporting
- Custom branding

Implement:

- Checkout
- Trial state
- Subscription state sync through verified webhooks
- Customer billing portal
- Upgrade/downgrade handling
- Cancellation
- Graceful past-due behavior
- Feature entitlements enforced on the server
- Usage tracking
- Idempotent webhook processing
- Test-mode setup

Do not store card data. Use Stripe-hosted payment flows.

Clearly document decisions needed for refunds, trial abuse, taxes, annual plans, overages, cancellation timing, and failed payments. If automated sales-tax compliance is not implemented, state exactly what remains.

## 27. Public website and customer acquisition foundation

Build a polished public marketing site at blueprintbid.com and app routes or subdomain structure as appropriate.

The style should be modern, professional, construction-oriented, and dark without becoming difficult to read. It may take structural inspiration from excellent construction SaaS websites, but must not copy another company’s design or text.

Include:

- Clear hero statement
- Product explanation
- Workflow
- Feature sections
- Evidence and estimator-control message
- Ideal-customer description
- Pricing
- FAQ
- Security/privacy summary
- Calls to action
- Login and trial signup
- Contact path
- Terms of Service link
- Privacy Policy link

Use honest content. Do not invent customer testimonials, savings percentages, integrations, certifications, or customer counts.

Add sensible SEO metadata, sitemap, robots configuration, social preview metadata, structured data where appropriate, analytics hooks with consent considerations, and an accessible responsive design.

## 28. Product UX requirements

The application must be usable by working estimators, not only software developers.

Priorities:

- Desktop-first but responsive
- Clear dense data tables
- Fast keyboard-friendly editing
- Autosave or explicit reliable save states
- Undo/history where appropriate
- Filters and saved views
- Clear status and error messages
- Source evidence adjacent to extracted data
- Bulk editing
- Currency and unit consistency
- Accessible contrast and controls
- Empty states that explain the next action
- Progress feedback for long-running document jobs
- No fake loading or fake completed analysis

Provide a guided sample project using synthetic, legally safe demo data so a new user can understand the workflow without uploading customer documents.

## 29. Security, privacy, and reliability

Implement production-minded controls:

- Server-side authorization
- Row-level tenant isolation
- Secure file-access policies
- Signed or controlled file URLs
- File type and size validation
- Rate limiting where necessary
- CSRF protection where relevant
- Secure headers
- Input validation
- Output escaping
- SQL injection protection through safe query methods
- Audit logs
- Secret management through environment variables
- Webhook signature verification
- Idempotency
- Safe error messages
- Dependency and vulnerability checks
- Backup and restore documentation
- Data retention/deletion design

Do not log sensitive document contents, secrets, or full payment details.

Provide a threat model covering cross-tenant access, uploaded malicious files, prompt injection, insecure direct-object references, exposed storage, compromised invitations, webhook replay, privilege escalation, and accidental proposal disclosure.

## 30. Observability and operations

Add or prepare:

- Structured application logging
- Error tracking integration
- Health checks
- Background-job status and retries
- Dead-letter or failed-job visibility
- Database migration procedures
- Usage and AI-cost monitoring
- Storage monitoring
- Basic administrative support tools
- Audit-event review
- Backup expectations
- Incident-response notes

Admin tools must not permit casual access to customer documents. Document least-privilege support procedures.

## 31. Testing and quality requirements

Create meaningful tests, not tests that only verify placeholders.

Include as appropriate:

- Unit tests for markup, margin, contingency, tax, labor, material yield, and estimate totals
- Unit tests for assembly calculations and overrides
- Integration tests for project and estimate workflows
- Database/RLS tests for tenant isolation
- Authentication and role tests
- Stripe webhook idempotency and entitlement tests
- File-validation tests
- Document-pipeline tests using small synthetic fixtures
- Proposal-content tests ensuring internal costs are not leaked
- End-to-end tests for signup, organization creation, project creation, upload, review, estimate, and proposal preview
- Accessibility checks
- Type checking
- Linting
- Production build verification

Seeded demo data and test fixtures must not contain copyrighted plan sets, private customer information, or real secrets.

## 32. Phased delivery strategy

Do not attempt unreliable full automation before the core system works.

Recommended phases:

### Phase 0 — Discovery and repository assessment

- Inspect repository and Codespace
- Record current architecture and gaps
- Identify reusable and obsolete code
- Establish commands, environment template, formatting, linting, testing, and CI
- Write an implementation plan and architecture decision record

### Phase 1 — SaaS foundation

- Marketing site
- Authentication
- Organization creation and membership
- Tenant isolation
- Project CRUD
- Secure document upload and inventory
- Catalog and company settings foundation

### Phase 2 — Manual-first estimating MVP

- Scope items
- Assemblies
- Materials, hardware, labor, and finishing catalogs
- Estimate versions
- Transparent calculations
- Assumptions, exclusions, alternates, allowances, and risks
- Proposal preview and PDF

This phase must be independently useful even before advanced AI works.

### Phase 3 — Assisted document review

- Text extraction and OCR
- Sheet/page classification
- Specification summaries
- Scope candidates with page citations
- Review queues
- Conflict warnings
- Usage and processing-cost tracking

### Phase 4 — Logistics, installation, and handoff

- Delivery comparison
- Installation planner
- Schedule durations
- Awarded-job handoff
- Estimate-versus-actual foundation

### Phase 5 — Monetization and launch readiness

- Stripe test mode
- Plans and entitlements
- Trial and customer portal
- Transactional email
- Legal-page placeholders clearly marked for owner/legal review
- Monitoring, backups, analytics, support workflow, and launch checklist

At the end of each phase, run tests and record what works, what remains, and what owner action is required.

## 33. Definition of done

The project is not complete merely because pages render.

A launch-candidate build should allow a user to:

1. Visit the marketing site.
2. Create an account and organization.
3. Start or subscribe through a Stripe test flow.
4. Create a millwork project.
5. Upload supported bid documents securely.
6. View processing state and document inventory.
7. Review extracted or manually entered scope.
8. Build an estimate from configurable company data.
9. Inspect every major cost calculation.
10. Add qualifications, exclusions, allowances, alternates, and risks.
11. Review logistics and installation allowances.
12. Generate a customer-safe proposal preview/PDF.
13. Reopen the project without losing work.
14. Remain isolated from every other tenant.

Additionally:

- Migrations must run from a clean database.
- Seed/demo setup must work.
- Type checking, linting, tests, and production build must pass.
- Required environment variables must be documented.
- No secrets may be committed.
- Known limitations must be stated honestly.
- Owner setup instructions must be complete.

## 34. Required repository documentation

Maintain:

- README.md for owner setup and operation
- CONTRIBUTING.md for development workflow
- SECURITY.md for security reporting and practices
- docs/architecture.md
- docs/estimating-model.md
- docs/document-processing.md
- docs/data-model.md or generated schema documentation
- docs/deployment.md
- docs/operations.md
- docs/launch-checklist.md
- docs/owner-decisions.md
- Architecture decision records for major choices
- .env.example containing names and explanations but no secrets

## 35. Mandatory final owner README

After completing the build, rewrite the root README.md as an exceptionally detailed owner/operator guide. Assume the owner is comfortable following instructions but may not know deployment terminology.

The README must include:

### A. What was built

- Product summary
- Implemented features
- Partially implemented features
- Features intentionally deferred
- Known limitations
- Honest status of document AI accuracy

### B. Local Codespace operation

- Exact prerequisites
- Exact commands in order
- Dependency installation
- Environment setup
- Database setup
- Migration and seed commands
- Starting the application
- Running workers if separate
- Opening the preview
- Running tests
- Troubleshooting common failures

### C. Every external account the owner must create

For each required or optional service, explain:

- Why it is needed
- Whether it is required for local development, production, or both
- Official signup location
- Recommended account/project naming
- Free versus paid considerations
- Exact settings to choose
- Where to obtain each key or identifier
- Which environment variable receives it
- Whether the value is secret
- How to test the connection
- How to rotate or revoke it

Likely categories include GitHub, deployment hosting, Supabase/PostgreSQL, Stripe, transactional email, OCR/AI provider, error tracking, analytics, domain/DNS provider, and optional sales-tax tooling. Only list services actually used by the implemented architecture.

### D. Domain setup for blueprintbid.com

- Where the app is deployed
- How to attach blueprintbid.com
- Recommended handling of www
- Any recommended app subdomain
- Exact DNS record types, names, and where the target values come from
- SSL expectations
- DNS propagation explanation
- Verification procedure
- Email-domain DNS records if transactional email is configured
- Warning not to overwrite unrelated existing DNS records

Do not invent provider-specific DNS target values. State exactly where the owner will retrieve the real values.

### E. Stripe and making money

- Test-mode setup
- Product and price creation or automated provisioning
- Trial configuration
- Checkout
- Billing portal
- Webhook endpoint and events
- Webhook signing secret
- Local webhook testing
- Plan-to-entitlement mapping
- Test card procedure
- Switching to live mode
- Business verification
- Bank payout setup
- Refund and cancellation configuration
- Sales-tax decision
- How to confirm a customer can subscribe and receive access

### F. Email and customer communications

- Sender-domain verification
- Required DNS records
- From/reply-to addresses
- Email templates implemented
- Signup verification
- Invitations
- Billing messages handled by Stripe versus the app
- Deliverability testing

### G. AI/document-processing setup

- Provider account setup
- API credentials
- Model/service selection
- OCR requirements
- Cost-control settings
- Usage limits
- Supported document types and sizes
- Processing workflow
- Accuracy limitations
- How citations and human review work
- How to test with synthetic documents
- What happens when a provider is unavailable

### H. Production deployment

- Exact commands or dashboard steps
- Environment variables
- Production database migrations
- Storage configuration
- Background workers/queues
- Build command
- Start command
- Health check
- Rollback procedure
- Preview/staging environment
- Production verification checklist

### I. Security and privacy checklist

- Secrets
- Row-level security
- Storage policies
- Backups
- Access review
- Logging
- Customer document privacy
- Data deletion/export
- Incident response
- Dependency updates
- What should be reviewed by a security professional before broad launch

### J. Legal and business checklist

Clearly label this as operational information, not legal or tax advice. Include owner tasks for:

- Business entity and banking
- Terms of Service review
- Privacy Policy review
- Acceptable-use policy
- AI and estimate disclaimer
- Data-processing disclosures
- Copyright/document-upload representations
- Refund and cancellation policy
- Sales-tax review
- Insurance considerations
- Support contact
- Customer onboarding

### K. Launch checklist

Provide a checkbox-style sequence from test environment through the first paying customer. Include testing signup, subscription, email, upload, document processing, tenant isolation, proposal generation, cancellation, backup, support inbox, analytics, and monitoring.

### L. Routine operation

- How to add or change plans
- How to update prices
- How to monitor failed jobs
- How to inspect webhook failures
- How to help a customer safely
- How to manage storage and AI costs
- How to back up and restore
- How to deploy updates
- How to roll back
- How to review security updates

### M. Troubleshooting

Include symptoms, likely causes, exact checks, and resolutions for common authentication, database, storage, upload, OCR/AI, PDF generation, Stripe, email, DNS, build, and deployment failures.

## 36. Final completion report

At the end of your work, provide a concise terminal summary containing:

- What you implemented
- Important architecture decisions
- Test/build results
- Exact files containing setup instructions
- External actions the owner must still perform
- Known limitations
- The safest next development priority

Do not say the project is production-ready unless the production configuration, security controls, tenant isolation, billing, backups, monitoring, and core workflow have been verified.

## 37. Start now

Begin by inspecting the repository, Git status, package manifests, existing documentation, environment examples, database files, and deployment configuration. Preserve useful work, but do not feel obligated to keep a weak prior architecture simply because it exists.

Then:

1. Summarize the current repository state.
2. Write the phased implementation plan.
3. Identify immediate blockers without stopping work that can proceed.
4. Implement the highest-value working vertical slice.
5. Validate it with tests and a production build.
6. Continue through the phases as far as the environment permits.
7. Maintain the owner README and supporting documentation throughout the build.

Build BlueprintBid as a serious estimating product whose calculations and evidence a professional millwork estimator can inspect, understand, correct, and trust.
