import { JSONContent } from "@tiptap/core";

function paragraph(text: string): JSONContent {
  if (!text) {
    return { type: "paragraph" };
  }
  return {
    type: "paragraph",
    content: [{ type: "text", text }],
  };
}

function heading(text: string, level: 1 | 2 | 3): JSONContent {
  return {
    type: "heading",
    attrs: { level },
    content: text ? [{ type: "text", text }] : undefined,
  };
}

export function plainTextToDoc(text: string): JSONContent {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const content: JSONContent[] = lines.map((line) => paragraph(line));
  return { type: "doc", content: content.length ? content : [paragraph("")] };
}

export function markdownToDoc(markdown: string): JSONContent {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const content: JSONContent[] = [];
  let listKind: "bullet" | "ordered" | null = null;
  let listItems: JSONContent[] = [];

  const flushList = () => {
    if (!listKind || listItems.length === 0) {
      listKind = null;
      listItems = [];
      return;
    }
    content.push({
      type: listKind === "bullet" ? "bulletList" : "orderedList",
      content: listItems,
    });
    listKind = null;
    listItems = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = line.match(/^[-*]\s+(.*)$/);
    const ordered = line.match(/^\d+\.\s+(.*)$/);

    if (bullet) {
      if (listKind !== "bullet") flushList();
      listKind = "bullet";
      listItems.push({
        type: "listItem",
        content: [paragraph(bullet[1])],
      });
      continue;
    }

    if (ordered) {
      if (listKind !== "ordered") flushList();
      listKind = "ordered";
      listItems.push({
        type: "listItem",
        content: [paragraph(ordered[1])],
      });
      continue;
    }

    flushList();

    if (line.startsWith("### ")) {
      content.push(heading(line.slice(4), 3));
    } else if (line.startsWith("## ")) {
      content.push(heading(line.slice(3), 2));
    } else if (line.startsWith("# ")) {
      content.push(heading(line.slice(2), 1));
    } else {
      content.push(paragraph(line));
    }
  }

  flushList();
  return { type: "doc", content: content.length ? content : [paragraph("")] };
}

export function htmlToPlainish(html: string): string {
  return html
    .replace(/<\/(p|h1|h2|h3|li|div)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

export function emptyDoc(): JSONContent {
  return { type: "doc", content: [{ type: "paragraph" }] };
}

export function titleFromFilename(filename: string) {
  return filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || "Imported document";
}
