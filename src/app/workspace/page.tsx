"use client";
import { useEffect, useState } from "react";
import Workspace from "./editor";
import { Members } from "./members";
import { TeamBilling } from "./team-billing";
import { Project } from "@/lib/model";
import { demoProject, uid } from "@/lib/demo";
export default function Hosted() {
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]),
    [org, setOrg] = useState(""),
    [projects, setProjects] = useState<Project[]>([]),
    [active, setActive] = useState<Project | null>(null),
    [name, setName] = useState(""),
    [message, setMessage] = useState("Loading hosted workspace…");
  async function load(organizationId?: string) {
    try {
      const res = await fetch(
        "/api/projects" +
          (organizationId ? `?organizationId=${organizationId}` : ""),
      );
      if (!res.ok)
        throw new Error(
          "Sign in first, and ensure the owner has configured Supabase and applied the migration.",
        );
      const data = await res.json();
      setOrgs(data.organizations);
      setProjects(data.projects.map((r: { data: Project }) => r.data));
      if (organizationId) setOrg(organizationId);
      else if (data.organizations[0]) setOrg(data.organizations[0].id);
      setMessage("");
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  useEffect(() => {
    void fetch("/api/projects")
      .then(async (res) => {
        if (!res.ok)
          throw new Error("Sign in first, and ensure Supabase is configured.");
        return res.json();
      })
      .then((data) => {
        setOrgs(data.organizations);
        setProjects(data.projects.map((r: { data: Project }) => r.data));
        if (data.organizations[0]) setOrg(data.organizations[0].id);
        setMessage("");
      })
      .catch((e) => setMessage(e.message));
  }, []);
  async function createOrganization() {
    const res = await fetch("/api/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      setMessage(
        "Could not create organization. Check your session and organization name.",
      );
      return;
    }
    setName("");
    await load();
  }
  async function createProject() {
    const p = {
      ...demoProject(),
      id: uid(),
      name: name || "New millwork project",
      client: "",
      address: "",
      scope: [],
      qualifications: "",
      exclusions: "",
      terms: "",
      risks: "",
      logistics: {
        trips: "0",
        miles: "0",
        costPerMile: "0",
        driverHours: "0",
        driverRate: "0",
        outsideQuote: "0",
        installHours: "0",
        installRate: "0",
        crew: "0",
        hoursPerDay: "8",
        actualCost: "0",
      },
    };
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: org, project: p }),
    });
    if (!res.ok) {
      setMessage("Could not create project. Check membership permissions.");
      return;
    }
    setActive(p);
  }
  if (active)
    return (
      <>
        <div className="workspace">
          <button
            className="text-button"
            onClick={() => {
              setActive(null);
              load(org);
            }}
          >
            ← Back to project list (save changes first)
          </button>
        </div>
        <Workspace
          key={active.id}
          mode="hosted"
          initial={active}
          organizationId={org}
        />
      </>
    );
  return (
    <div className="workspace">
      <p className="eyebrow">HOSTED WORKSPACE</p>
      <h1 style={{ fontSize: 38 }}>Projects</h1>
      <p role="status">{message}</p>
      <a className="text-button" href="/login">
        Sign in / create account
      </a>
      <div className="card">
        <label>
          Organization
          <select value={org} onChange={(e) => load(e.target.value)}>
            <option value="">Select organization</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          New organization or project name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={200}
          />
        </label>
        <div className="actions">
          <button
            className="button secondary"
            onClick={createOrganization}
            disabled={!name.trim()}
          >
            Create organization
          </button>
          <button
            className="button"
            disabled={!org || !name.trim()}
            onClick={createProject}
          >
            Create project
          </button>
        </div>
      </div>
      <div className="grid three" style={{ marginTop: 20 }}>
        {projects.map((p) => (
          <button
            className="card"
            key={p.id}
            onClick={() => setActive(p)}
            style={{ color: "inherit", textAlign: "left" }}
          >
            <h3>{p.name}</h3>
            <p>
              {p.client || "Add client information"} · {p.status}
            </p>
          </button>
        ))}
      </div>
      <TeamBilling organizationId={org} />
      <Members organizationId={org} />
    </div>
  );
}
