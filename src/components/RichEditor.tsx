"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { JSONContent } from "@tiptap/core";
import { useEffect, useRef } from "react";
import { EditorToolbar } from "./EditorToolbar";

export function RichEditor({
  initialContent,
  editable,
  onChange,
}: {
  initialContent: JSONContent;
  editable: boolean;
  onChange: (content: JSONContent) => void;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "font-serif px-10 py-8 text-[1.05rem] text-[#1a1a18]",
      },
    },
    onUpdate: ({ editor: instance }) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        onChange(instance.getJSON());
      }, 700);
    },
  });

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!editor) return <div className="min-h-[60vh] px-10 py-8 text-sm text-[#8a8a84]">Loading editor…</div>;

  return (
    <div>
      <EditorToolbar editor={editor} disabled={!editable} />
      <EditorContent editor={editor} />
    </div>
  );
}
