"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DemoUser = { email: string; name: string };

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("alex@ajaia.dev");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<DemoUser[]>([]);

  useEffect(() => {
    fetch("/api/demo-users")
      .then((r) => r.json())
      .then((data) => setUsers(data.users ?? []))
      .catch(() => setUsers([]));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not sign in.");
      return;
    }
    router.push("/docs");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_20px_60px_rgba(40,35,20,0.08)] border border-[#ece9e2]">
      <p className="text-sm uppercase tracking-[0.18em] text-[#6b6b66]">Sign in</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Reviewer accounts</h2>
      <p className="mt-2 text-sm text-[#6b6b66]">
        Password for every seeded user is <code className="rounded bg-[#f3f1ec] px-1">demo1234</code>.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="text-[#6b6b66]">Email</span>
          <input
            className="mt-1 w-full rounded-lg border border-[#e7e5e0] px-3 py-2.5 outline-none focus:border-[#1f4b3a]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </label>
        <label className="block text-sm">
          <span className="text-[#6b6b66]">Password</span>
          <input
            className="mt-1 w-full rounded-lg border border-[#e7e5e0] px-3 py-2.5 outline-none focus:border-[#1f4b3a]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#1f4b3a] py-2.5 text-white font-medium hover:bg-[#17382c] disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Continue"}
        </button>
      </form>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-wide text-[#8a8a84]">Quick fill</p>
        <div className="mt-2 flex flex-col gap-2">
          {users.map((user) => (
            <button
              key={user.email}
              type="button"
              onClick={() => {
                setEmail(user.email);
                setPassword("demo1234");
              }}
              className="flex items-center justify-between rounded-lg border border-[#ece9e2] px-3 py-2 text-left text-sm hover:bg-[#f8f6f1]"
            >
              <span>{user.name}</span>
              <span className="text-[#8a8a84]">{user.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
