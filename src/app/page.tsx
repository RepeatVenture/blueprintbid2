import Link from "next/link";
export default function Home() {
  return (
    <>
      <section className="hero container">
        <div>
          <p className="eyebrow">FROM DRAWING SET TO DEFENSIBLE BID</p>
          <h1>
            Your craft.
            <br />
            Your numbers.
            <br />
            <em>A better bid.</em>
          </h1>
          <p className="lead">
            Millwork estimating that keeps you in control. Bring scope,
            materials, shop labor, installation, and proposal into one
            reviewable workflow.
          </p>
          <div className="actions">
            <Link className="button" href="/demo">
              Open sample project <span>↗</span>
            </Link>
            <a className="button secondary" href="#workflow">
              See the workflow ↓
            </a>
          </div>
          <p className="muted">
            Working product preview · Synthetic demo · No card required
          </p>
        </div>
        <div className="blueprint">
          <div className="drawing-label">
            A–501 <span>INTERIOR MILLWORK / ELEVATION 02</span>
          </div>
          <div className="dimension">←────────── 12′–0″ ──────────→</div>
          <div className="cabinet-drawing">
            {[1, 2, 3, 4].map((n) => (
              <div className="cabinet" key={n}>
                <div />
                <div />
                <span>▯</span>
              </div>
            ))}
          </div>
          <div className="drawing-foot">
            BREAK ROOM <span>VERIFY FIELD DIMENSIONS</span>
          </div>
          <div className="floating-card">
            <span className="status">ESTIMATOR CONTROL</span>
            <h3>Every number has a story.</h3>
            <p>Source → Scope → Components → Price</p>
            <div className="mini-row">
              <span>Material & hardware</span>
              <b>Reviewable</b>
            </div>
            <div className="mini-row">
              <span>Shop & field labor</span>
              <b>Explicit</b>
            </div>
            <div className="mini-row">
              <span>Markup & margin</span>
              <b>Transparent</b>
            </div>
          </div>
        </div>
      </section>
      <div className="strip">
        CUSTOM CABINETRY <span>＋</span> ARCHITECTURAL WOODWORK <span>＋</span>{" "}
        COMMERCIAL CASEWORK
      </div>
      <section className="container section" id="workflow">
        <p className="eyebrow">A WORKFLOW THAT THINKS LIKE AN ESTIMATOR</p>
        <h2>From first review to final number.</h2>
        <div className="grid three">
          {[
            [
              "01",
              "Define the scope",
              "Organize by room. Record the drawing reference, evidence, and responsibility. Resolve uncertainty before issuing.",
            ],
            [
              "02",
              "Build up the cost",
              "Inspect material, hardware, finish, and operation-based labor. Adjust the project without changing a company standard.",
            ],
            [
              "03",
              "Stand behind the proposal",
              "Review price calculations and qualifications. Save a version and export a proposal that keeps your internal costs private.",
            ],
          ].map(([n, t, d]) => (
            <article className="card" key={n}>
              <span className="step">{n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="container section feature">
        <div>
          <p className="eyebrow">EVIDENCE BEFORE AUTOMATION</p>
          <h2>
            Your experience is
            <br />
            part of the system.
          </h2>
        </div>
        <div>
          <p className="lead">
            A drawing is a starting point, not a guaranteed quantity.
            BlueprintBid puts references, assumptions, and review status beside
            the work you’re pricing.
          </p>
          <p>
            Manual estimating is available in the demo today. Automated drawing
            interpretation and OCR are not yet available. No black-box totals.
            No invented accuracy claims.
          </p>
        </div>
      </section>
      <section className="container section" id="pricing">
        <p className="eyebrow">PLANNED SUBSCRIPTIONS</p>
        <h2>A home for your estimating practice.</h2>
        <p>
          Launch pricing assumptions, subject to owner confirmation. Paid signup
          is not open.
        </p>
        <div className="grid three">
          {[
            ["Starter", "79", "For a small estimating practice"],
            ["Pro", "179", "For a growing millwork team"],
            ["Studio", "399", "For a coordinated production shop"],
          ].map(([n, p, d]) => (
            <article className="card" key={n}>
              <h3>{n}</h3>
              <p>{d}</p>
              <div className="price">
                ${p}
                <small>/ month</small>
              </div>
              <p>
                Planned seven-day card-required trial at launch. Final limits
                and commercial terms are pending.
              </p>
              <Link className="button secondary" href="/demo">
                Explore the product
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="container section faq">
        <h2>Before you begin.</h2>
        <details>
          <summary>
            Will it estimate an entire drawing set automatically?
          </summary>
          <p>
            No. The current release supports manual scope and transparent
            costing. Document automation must earn trust through citations and
            human review.
          </p>
        </details>
        <details>
          <summary>Can I use my own shop costs?</summary>
          <p>
            Yes. Every component quantity, waste factor, unit cost, and labor
            allowance in the workspace is editable. Sample prices are fictional
            examples.
          </p>
        </details>
        <details>
          <summary>Where is demo data stored?</summary>
          <p>
            Only in this browser’s local storage. Use synthetic information
            only. Hosted accounts require the owner to configure and validate
            the Supabase environment.
          </p>
        </details>
        <details>
          <summary>How do I contact support?</summary>
          <p>
            A public support address has not been configured. During evaluation,
            report issues to the repository owner through the project’s GitHub
            issues.
          </p>
        </details>
      </section>
    </>
  );
}
