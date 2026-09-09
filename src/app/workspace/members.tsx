"use client";
import { useState, useEffect } from "react";
type Member = { user_id: string; email: string; role: string };
export function Members({ organizationId }: { organizationId: string }) {
  const [members, setMembers] = useState<Member[]>([]),
    [message, setMessage] = useState(""),
    [pending, setPending] = useState("");
  useEffect(() => {
    if (!organizationId) return;
    let active = true;
    void fetch(`/api/members?organizationId=${organizationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (active) {
          setMembers(data.members || []);
          setMessage(data.error || "");
        }
      })
      .catch(() => {
        if (active) setMessage("Member directory unavailable.");
      });
    return () => {
      active = false;
    };
  }, [organizationId]);
  async function remove(userId: string) {
    try {
      const res = await fetch("/api/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, userId }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setMembers((rows) => rows.filter((r) => r.user_id !== userId));
      setMessage(
        "Access removed. Existing sessions can no longer access this organization.",
      );
      setPending("");
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  return (
    <div className="card" style={{ marginTop: 20 }}>
      <h3>Organization access</h3>
      <p>
        Removing a member immediately removes database and document access for
        this organization. Their audit history remains. Owner transfer is not
        yet supported.
      </p>
      <p role="status">{message}</p>
      {members.map((m) => (
        <div key={m.user_id} className="mini-row">
          <span>
            {m.email} · {m.role}
          </span>
          {m.role !== "owner" &&
            (pending === m.user_id ? (
              <div>
                <button
                  className="text-button"
                  onClick={() => remove(m.user_id)}
                >
                  Confirm removal
                </button>
                <button className="text-button" onClick={() => setPending("")}>
                  Keep access
                </button>
              </div>
            ) : (
              <button
                className="text-button"
                onClick={() => setPending(m.user_id)}
              >
                Remove access
              </button>
            ))}
        </div>
      ))}
    </div>
  );
}
