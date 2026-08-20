import { describe, expect, it } from "vitest";
import { markdownToDoc, plainTextToDoc, titleFromFilename } from "./import-doc";

describe("file import", () => {
  it("turns markdown headings and lists into TipTap JSON", () => {
    const doc = markdownToDoc("# Title\n\n- one\n- two\n\n1. first");
    expect(doc.content?.[0]).toMatchObject({ type: "heading", attrs: { level: 1 } });
    expect(doc.content?.some((n) => n.type === "bulletList")).toBe(true);
    expect(doc.content?.some((n) => n.type === "orderedList")).toBe(true);
  });

  it("keeps plain text lines as paragraphs", () => {
    const doc = plainTextToDoc("alpha\nbeta");
    expect(doc.content).toHaveLength(2);
  });

  it("derives a title from the filename", () => {
    expect(titleFromFilename("kickoff-notes.md")).toBe("kickoff notes");
  });
});
