# Estimating model

All numeric form inputs are decimal strings. Currency calculations use decimal.js at precision 40, round-half-up. Display and final currency extensions use two decimal places. Inputs allow at most four decimal places and reject negatives, nonfinite values and exponents. Percentages are 0–100; target margin must be below 100.

For each component: round(quantity × unit cost × (1 + waste/100), 2). These quantities are **per scope unit**. Sum the component extensions, multiply by scope quantity, then round to cents. Excluded scope and excluded responsibility contribute nothing.

Company delivery = trips × (round-trip miles per trip × vehicle cost per mile + driver hours per trip × burdened driver rate), rounded to cents. Installation = total person-hours × burdened installer rate, rounded to cents. Outside delivery quotes are comparison only and do not alter the total automatically. Installation days = ceiling(person-hours / (crew × productive hours/day)); zero capacity yields no duration.

Direct cost = included scope + company delivery + installation + allowance costs. Overhead = rounded direct cost × overhead%. Contingency = rounded (direct + overhead) × contingency%. Tax allowance = rounded taxable component costs × tax%. It is a procurement-cost allowance, not an automated jurisdictional sales-tax determination. Allowance costs must include any applicable purchase tax explicitly.

Estimated cost = direct + overhead + contingency + tax allowance. Markup selling price = rounded cost × (1 + markup%). Target-margin selling price = rounded cost / (1 − margin%). Gross profit = selling price − estimated cost. Gross margin = gross profit / selling price; defined as zero for a zero selling price.

Commercial items:
- Allowances contribute quantity × unit cost to base direct cost. Customer proposals show them as included, not added twice.
- Add/deduct alternates and unit prices are separate offers. Their cost receives the same overhead, contingency and pricing rates. They do not affect the base bid. Deduct values are positive and labeled as deducts. Set unit-price quantity to one.
- Component tax is not automatically applied to commercial items; include purchase tax in their cost.
- Vendor quotes include base + freight + tax for comparison. Selecting one does not mutate pricing. An estimator explicitly copies the appropriate landed cost into a subcontract component.
- Risk exposure is comparison-only. High-impact open risks block issue; accepted/resolved risks require a reason. Do not count both an allowance and the same contingency twice.

Assembly templates are immutable versions. Applying a template copies its components into an independent project instance and resets review status. The initial template is an illustrative two-door base cabinet, not an engineered bill of materials. Add labor operations for engineering, field measuring, PM, machining, finishing and installation as needed. The system does not infer dimension-based components yet.

`sheetYield` provides a deterministic rectangular, fixed-grain layout with kerf and whole-sheet purchasing. It does not rotate parts, optimize mixed nesting, match veneer, account for defects, or replace a cut optimizer. The UI currently uses estimator-entered material quantities.

Issuance requires included, confirmed, priced scope, known responsibilities, terms and addressed high-impact risks. Existing issued snapshots cannot be edited or removed in hosted Postgres. Currency is USD only. Customer PDF text currently replaces non-ASCII characters with `?`; add an embedded Unicode font before multilingual proposals. Automated tests cover the stated calculations and boundaries.

Hosted issuance now also runs in PostgreSQL: validated inputs produce an authoritative allowlisted snapshot using `numeric` arithmetic. Parity fixtures compare the full JSON projection against decimal.js, including fractional quantities, margin, tax and commercial items. Save each issued hosted version before creating another; the UI prevents multiple pending versions.
