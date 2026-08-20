"use client";

import type { Editor } from "@tiptap/react";

export function EditorToolbar({ editor, disabled }: { editor: Editor; disabled: boolean }) {
  const btn = (active: boolean) =>
    `rounded-md px-2.5 py-1 text-sm ${active ? "bg-[#1f4b3a] text-white" : "hover:bg-[#f3f1ec]"} ${
      disabled ? "opacity-40 pointer-events-none" : ""
    }`;

  return (
    <div className="flex flex-wrap gap-1 border-b border-[#ece9e2] px-4 py-2">
      <button type="button" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>
        Bold
      </button>
      <button type="button" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}>
        Italic
      </button>
      <button
        type="button"
        className={btn(editor.isActive("underline"))}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        Underline
      </button>
      <span className="mx-1 w-px bg-[#ece9e2]" />
      <button
        type="button"
        className={btn(editor.isActive("heading", { level: 1 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </button>
      <button
        type="button"
        className={btn(editor.isActive("heading", { level: 2 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </button>
      <button
        type="button"
        className={btn(editor.isActive("heading", { level: 3 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </button>
      <span className="mx-1 w-px bg-[#ece9e2]" />
      <button
        type="button"
        className={btn(editor.isActive("bulletList"))}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        Bullets
      </button>
      <button
        type="button"
        className={btn(editor.isActive("orderedList"))}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        Numbers
      </button>
    </div>
  );
}
