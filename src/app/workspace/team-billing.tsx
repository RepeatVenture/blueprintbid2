"use client";
import { useState } from "react";
export function TeamBilling({ organizationId }: { organizationId: string }) {
  const [email, setEmail] = useState(""),
    [role, setRole] = useState("estimator"),
    [token, setToken] = useState(""),
    [message, setMessage] = useState(""),
    [plan, setPlan] = useState("starter"),
    [busy, setBusy] = useState(false);
  async function post(path: string, body: unknown) {
    setBusy(true);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      if (result.url) {
        const url = new URL(result.url);
        if (
          !["checkout.stripe.com", "billing.stripe.com"].includes(url.hostname)
        )
          throw new Error("Unexpected billing destination");
        location.assign(url.href);
      } else if (result.token)
        setMessage(
          `Invitation code (share privately with ${email}; expires in seven days): ${result.token}`,
        );
      else
        setMessage(
          "Invitation accepted. Reload the project list to see your organization.",
        );
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="card" style={{ marginTop: 24 }}>
      <h3>Team & billing</h3>
      <p>
        Organization owners and administrators can create invitation codes. No
        email is sent. Each code is bound to the invited user’s confirmed email
        and can be used once.
      </p>
      <div className="fields">
        <label>
          Invite email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {[
              "administrator",
              "estimator",
              "project_manager",
              "draftsperson",
              "viewer",
            ].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
      </div>
      <button
        disabled={busy || !organizationId || !email}
        className="button secondary"
        onClick={() =>
          post("/api/invitations", { organizationId, email, role })
        }
      >
        Create invitation code
      </button>
      <label>
        Accept invitation code
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          autoComplete="off"
        />
      </label>
      <button
        disabled={busy || token.length !== 64}
        className="button secondary"
        onClick={() => post("/api/invitations", { token })}
      >
        Accept invitation
      </button>
      <p>
        Billing requires configured Stripe test prices. Evaluation organizations
        allow three projects; paid plans allow 10 / 50 / 200. Existing data
        remains editable after cancellation, but new project creation is
        blocked.
      </p>
      <label>
        Plan
        <select value={plan} onChange={(e) => setPlan(e.target.value)}>
          {["starter", "pro", "studio"].map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <div className="actions">
        <button
          className="button"
          disabled={busy || !organizationId}
          onClick={() =>
            post("/api/billing/checkout", { organizationId, plan })
          }
        >
          Open Stripe checkout
        </button>
        <button
          className="button secondary"
          disabled={busy || !organizationId}
          onClick={() => post("/api/billing/portal", { organizationId })}
        >
          Manage subscription
        </button>
      </div>
      <p role="status" style={{ overflowWrap: "anywhere" }}>
        {message}
      </p>
    </div>
  );
}
