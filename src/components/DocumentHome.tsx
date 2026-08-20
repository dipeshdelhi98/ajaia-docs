"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type User = { id: string; email: string; name: string };

type DocItem = {
  id: string;
  title: string;
  updatedAt: string;
  kind: "owned" | "shared";
  role?: string;
  owner: User;
  shareCount: number;
  attachmentCount: number;
};

export function DocumentHome({ user }: { user: User }) {
  const router = useRouter();
  const [owned, setOwned] = useState<DocItem[]>([]);
  const [shared, setShared] = useState<DocItem[]>([]);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/documents");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not load documents.");
      return;
    }
    setOwned(data.owned);
    setShared(data.shared);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createDoc() {
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled document" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not create document.");
      return;
    }
    router.push(`/docs/${data.id}`);
  }

  async function importFile(file: File) {
    setImporting(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/documents/import", { method: "POST", body: form });
    const data = await res.json();
    setImporting(false);
    if (!res.ok) {
      setError(data.error ?? "Import failed.");
      return;
    }
    router.push(`/docs/${data.id}`);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#e7e5e0] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#6b6b66]">Ajaia Docs</p>
            <h1 className="text-lg font-semibold">Your workspace</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:block text-[#6b6b66]">
              {user.name} · {user.email}
            </span>
            <button onClick={logout} className="rounded-lg border border-[#e7e5e0] px-3 py-1.5 hover:bg-[#f8f6f1]">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={createDoc}
            className="rounded-lg bg-[#1f4b3a] px-4 py-2 text-sm font-medium text-white hover:bg-[#17382c]"
          >
            New document
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border border-[#e7e5e0] bg-white px-4 py-2 text-sm hover:bg-[#f8f6f1]"
          >
            {importing ? "Importing…" : "Import .txt / .md / .docx"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.markdown,.docx,text/plain,text/markdown"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importFile(file);
              e.target.value = "";
            }}
          />
        </div>
        <p className="mt-3 max-w-2xl text-sm text-[#6b6b66]">
          Import creates a new editable document from the file and keeps the original as an
          attachment. Supported types: <strong>.txt</strong>, <strong>.md</strong>, <strong>.docx</strong>{" "}
          (max 4 MB).
        </p>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

        <Section title="Owned by you" empty="Create a document or import a file to get started.">
          {owned.map((doc) => (
            <DocCard key={doc.id} doc={doc} />
          ))}
        </Section>

        <Section title="Shared with you" empty="Nothing shared yet. Ask another seeded user to share a doc.">
          {shared.map((doc) => (
            <DocCard key={doc.id} doc={doc} />
          ))}
        </Section>
      </main>
    </div>
  );
}

function Section({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const hasItems = items.filter(Boolean).length > 0;
  return (
    <section className="mt-10">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6b6b66]">{title}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {hasItems ? children : <p className="text-sm text-[#8a8a84] sm:col-span-2">{empty}</p>}
      </div>
    </section>
  );
}

function DocCard({ doc }: { doc: DocItem }) {
  return (
    <Link
      href={`/docs/${doc.id}`}
      className="rounded-xl border border-[#ece9e2] bg-white p-4 hover:border-[#1f4b3a]/30 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium leading-snug">{doc.title}</h3>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] uppercase tracking-wide ${
            doc.kind === "owned"
              ? "bg-[#e8f3ee] text-[#1f4b3a]"
              : doc.role === "viewer"
                ? "bg-[#eceaf3] text-[#3d3a6b]"
                : "bg-[#f3eee4] text-[#6a4b1d]"
          }`}
        >
          {doc.kind === "owned" ? "Owned" : doc.role === "viewer" ? "Viewer" : "Editor"}
        </span>
      </div>
      <p className="mt-2 text-sm text-[#6b6b66]">
        {doc.kind === "shared" ? `Owner: ${doc.owner.name} · ${doc.role === "viewer" ? "view only" : "can edit"}` : `${doc.shareCount} shared`}
        {doc.attachmentCount ? ` · ${doc.attachmentCount} file` : ""}
      </p>
      <p className="mt-1 text-xs text-[#8a8a84]">Updated {new Date(doc.updatedAt).toLocaleString()}</p>
    </Link>
  );
}
