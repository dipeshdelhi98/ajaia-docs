"use client";

import { FormEvent, useState } from "react";

type User = { id: string; email: string; name: string };
type Share = { id: string; role: string; user: User };

export function ShareDialog({
  documentId,
  shares,
  onClose,
  onChanged,
}: {
  documentId: string;
  shares: Share[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [email, setEmail] = useState("jordan@ajaia.dev");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function addShare(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch(`/api/documents/${documentId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not share.");
      return;
    }
    setEmail("");
    onChanged();
  }

  async function changeRole(userId: string, nextRole: "editor" | "viewer") {
    setBusy(true);
    await fetch(`/api/documents/${documentId}/share`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: nextRole }),
    });
    setBusy(false);
    onChanged();
  }

  async function revoke(userId: string) {
    setBusy(true);
    await fetch(`/api/documents/${documentId}/share`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setBusy(false);
    onChanged();
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Share document</h2>
            <p className="mt-1 text-sm text-[#6b6b66]">
              Editors can change the doc. Viewers can only read it.
            </p>
          </div>
          <button onClick={onClose} className="text-sm text-[#6b6b66]">
            Close
          </button>
        </div>

        <form onSubmit={addShare} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jordan@ajaia.dev"
            className="flex-1 rounded-lg border border-[#e7e5e0] px-3 py-2 text-sm outline-none focus:border-[#1f4b3a]"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
            className="rounded-lg border border-[#e7e5e0] px-2 py-2 text-sm"
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button
            disabled={busy}
            className="rounded-lg bg-[#1f4b3a] px-3 py-2 text-sm text-white disabled:opacity-60"
          >
            Invite
          </button>
        </form>
        {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}

        <ul className="mt-4 space-y-2">
          {shares.length === 0 ? (
            <li className="text-sm text-[#8a8a84]">No one else has access yet.</li>
          ) : (
            shares.map((share) => (
              <li key={share.id} className="flex items-center justify-between gap-2 rounded-lg border border-[#ece9e2] px-3 py-2 text-sm">
                <span>
                  {share.user.name}
                  <span className="block text-xs text-[#8a8a84]">{share.user.email}</span>
                </span>
                <span className="flex items-center gap-2">
                  <select
                    value={share.role === "viewer" ? "viewer" : "editor"}
                    disabled={busy}
                    onChange={(e) => changeRole(share.user.id, e.target.value as "editor" | "viewer")}
                    className="rounded border border-[#e7e5e0] px-1 py-1 text-xs"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button onClick={() => revoke(share.user.id)} className="text-xs text-red-700">
                    Remove
                  </button>
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
