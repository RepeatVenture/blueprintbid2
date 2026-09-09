"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase-browser";
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const configured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  async function recover() {
    setBusy(true);
    try {
      const db = browserClient();
      if (!db) throw new Error("Hosted accounts are not configured.");
      await db.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || location.origin}/auth/callback`,
      });
      setMessage(
        "If this email can receive recovery messages, check your inbox. Open the link in this browser.",
      );
    } catch {
      setMessage("Recovery is unavailable. Check hosted email configuration.");
    } finally {
      setBusy(false);
    }
  }
  async function submit(signup: boolean) {
    setBusy(true);
    setMessage("");
    try {
      const db = browserClient();
      if (!db) throw new Error("Hosted accounts are not configured.");
      const { data, error } = signup
        ? await db.auth.signUp({ email, password })
        : await db.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      if (data.session) router.push("/workspace");
      else
        setMessage(
          "Check your email to confirm your account, then return here to sign in.",
        );
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth card">
      <p className="eyebrow">YOUR ESTIMATING WORKSPACE</p>
      <h1 style={{ fontSize: 38 }}>Welcome to BlueprintBid.</h1>
      {!configured ? (
        <div className="banner">
          Hosted accounts are not configured. The owner must connect Supabase
          before signup is available.{" "}
          <Link href="/demo">Explore the local demo →</Link>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(false);
          }}
        >
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              minLength={12}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <div className="actions">
            <button className="button" disabled={busy}>
              Sign in
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={busy || password.length < 12 || !email.includes("@")}
              onClick={() => submit(true)}
            >
              Create account
            </button>
          </div>
          <p className="muted">
            <button
              type="button"
              className="text-button"
              disabled={busy || !email.includes("@")}
              onClick={recover}
            >
              Send password reset email
            </button>
            <br />
            Use at least 12 characters. Email confirmation is controlled by your
            organization’s Supabase setup.
          </p>
        </form>
      )}
      <p role="status">{message}</p>
    </div>
  );
}
