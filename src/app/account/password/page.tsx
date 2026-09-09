"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase-browser";
export default function Password() {
  const [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit() {
    setBusy(true);
    try {
      if (password.length < 12 || password !== confirm)
        throw new Error(
          "Passwords must match and have at least 12 characters.",
        );
      const db = browserClient();
      if (!db) throw new Error("Hosted accounts are not configured.");
      const {
        data: { user },
        error: session,
      } = await db.auth.getUser();
      if (session || !user)
        throw new Error(
          "Open a fresh password-reset email in the browser where you requested it.",
        );
      const { error } = await db.auth.updateUser({ password });
      if (error)
        throw new Error(
          "Password update failed. Check the password policy or request another recovery email.",
        );
      await db.auth.signOut();
      router.push("/login");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth card">
      <h1 style={{ fontSize: 36 }}>Set your password</h1>
      <p>After saving, sign in again with your new password.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <label>
          New password
          <input
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label>
          Confirm new password
          <input
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
        <button className="button" disabled={busy}>
          Save new password
        </button>
      </form>
      <p role="status">{message}</p>
    </div>
  );
}
