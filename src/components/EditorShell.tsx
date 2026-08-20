"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { JSONContent } from "@tiptap/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RichEditor } from "./RichEditor";
import { ShareDialog } from "./ShareDialog";

type User = { id: string; email: string; name: string };
type Share = { id: string; user: User };
type Attachment = { id: string; filename: string; size: number };

type DocPayload = {
  id: string;
  title: string;
  content: JSONContent;
  updatedAt: string;
  owner: User;
  isOwner: boolean;
  canShare: boolean;
  canEdit: boolean;
  shares: Share[];
  attachments: Attachment[];
};

export function EditorShell({ documentId, user }: { documentId: string; user: User }) {
  const router = useRouter();
  const [doc, setDoc] = useState<DocPayload | null>(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"loading" | "saved" | "saving" | "error">("loading");
  const [error, setError] = useState("");
  const [shareOpen, setShareOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/documents/${documentId}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not open document.");
      setStatus("error");
      return;
    }
    setDoc(data);
    setTitle(data.title);
    setStatus("saved");
  }, [documentId]);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(body: Record<string, unknown>) {
    setStatus("saving");
    const res = await fetch(`/api/documents/${documentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Save failed.");
      setStatus("error");
      return;
    }
    setStatus("saved");
    setDoc((prev) => (prev ? { ...prev, updatedAt: data.updatedAt, title: data.title ?? prev.title } : prev));
  }

  async function rename(next: string) {
    const trimmed = next.trim();
    if (!trimmed || trimmed === doc?.title) return;
    await patch({ title: trimmed });
  }

  async function remove() {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    const res = await fetch(`/api/documents/${documentId}`, { method: "DELETE" });
    if (res.ok) router.push("/docs");
  }

  const initialContent = useMemo(() => doc?.content, [doc?.id]);

  if (status === "loading") {
    return <p className="p-8 text-sm text-[#6b6b66]">Opening document…</p>;
  }

  if (!doc) {
    return (
      <div className="p-8">
        <p className="text-red-700">{error || "Document unavailable."}</p>
        <Link href="/docs" className="mt-4 inline-block text-sm underline">
          Back to documents
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f1ec]">
      <header className="sticky top-0 z-10 border-b border-[#e7e5e0] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link href="/docs" className="text-sm text-[#6b6b66] hover:text-black">
            ← Docs
          </Link>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => rename(title)}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            disabled={!doc.canEdit}
            className="min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none"
          />
          <span
            className={`hidden sm:inline rounded-full px-2 py-0.5 text-[11px] uppercase tracking-wide ${
              doc.isOwner ? "bg-[#e8f3ee] text-[#1f4b3a]" : "bg-[#f3eee4] text-[#6a4b1d]"
            }`}
          >
            {doc.isOwner ? "Owner" : "Shared"}
          </span>
          <span className="text-xs text-[#8a8a84]">
            {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Error"}
          </span>
          {doc.canShare ? (
            <button
              onClick={() => setShareOpen(true)}
              className="rounded-lg bg-[#1f4b3a] px-3 py-1.5 text-sm text-white"
            >
              Share
            </button>
          ) : null}
          {doc.isOwner ? (
            <button onClick={remove} className="rounded-lg border border-[#e7e5e0] px-3 py-1.5 text-sm">
              Delete
            </button>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-3 text-sm text-[#6b6b66]">
        Owner {doc.owner.name} · signed in as {user.name}
        {doc.attachments.length ? ` · Source file: ${doc.attachments[0].filename}` : ""}
      </div>

      {error && status === "error" ? <p className="mx-auto max-w-3xl px-4 text-sm text-red-700">{error}</p> : null}

      <div className="mx-auto mb-16 max-w-3xl px-4">
        <div className="rounded-2xl border border-[#ece9e2] bg-white shadow-[0_12px_40px_rgba(40,35,20,0.06)]">
          {initialContent ? (
            <RichEditor
              key={doc.id}
              initialContent={initialContent}
              editable={doc.canEdit}
              onChange={(content) => patch({ content })}
            />
          ) : null}
        </div>
      </div>

      {shareOpen ? (
        <ShareDialog
          documentId={doc.id}
          shares={doc.shares}
          onClose={() => setShareOpen(false)}
          onChanged={load}
        />
      ) : null}
    </div>
  );
}
