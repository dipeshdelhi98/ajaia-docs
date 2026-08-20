import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { htmlToPlainish, markdownToDoc, plainTextToDoc, titleFromFilename } from "@/lib/import-doc";
import mammoth from "mammoth";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set([
  "text/plain",
  "text/markdown",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a .txt, .md, or .docx file." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "That file is empty." }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Files must be 4 MB or smaller." }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    const isTxt = name.endsWith(".txt");
    const isMd = name.endsWith(".md") || name.endsWith(".markdown");
    const isDocx = name.endsWith(".docx");

    if (!isTxt && !isMd && !isDocx) {
      return NextResponse.json(
        { error: "Supported types: .txt, .md, and .docx." },
        { status: 400 },
      );
    }

    if (file.type && !ALLOWED.has(file.type) && file.type !== "application/octet-stream") {
      // Some browsers send empty or generic MIME types; extension check is source of truth.
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let content;

    if (isTxt) {
      content = plainTextToDoc(buffer.toString("utf8"));
    } else if (isMd) {
      content = markdownToDoc(buffer.toString("utf8"));
    } else {
      const result = await mammoth.convertToHtml({ buffer });
      content = plainTextToDoc(htmlToPlainish(result.value));
    }

    const document = await prisma.document.create({
      data: {
        title: titleFromFilename(file.name),
        ownerId: user.id,
        content: JSON.stringify(content),
      },
    });

    const uploadDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadDir, { recursive: true });
    const storedName = `${document.id}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    await writeFile(path.join(uploadDir, storedName), buffer);

    await prisma.attachment.create({
      data: {
        documentId: document.id,
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        storedName,
      },
    });

    return NextResponse.json({ id: document.id, title: document.title }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
