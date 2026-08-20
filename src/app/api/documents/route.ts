import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { emptyDoc } from "@/lib/import-doc";

export async function GET() {
  try {
    const user = await requireUser();

    const owned = await prisma.document.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { shares: true, attachments: true } },
      },
    });

    const sharedRows = await prisma.documentShare.findMany({
      where: { userId: user.id },
      include: {
        document: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
            _count: { select: { shares: true, attachments: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      owned: owned.map((doc) => serializeListItem(doc, "owned")),
      shared: sharedRows.map((row) => serializeListItem(row.document, "shared", row.role)),
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => ({}));
    const title = String(body.title ?? "Untitled document").trim() || "Untitled document";

    const document = await prisma.document.create({
      data: {
        title,
        ownerId: user.id,
        content: JSON.stringify(emptyDoc()),
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

function serializeListItem(
  doc: {
    id: string;
    title: string;
    updatedAt: Date;
    createdAt: Date;
    owner: { id: string; name: string; email: string };
    _count: { shares: number; attachments: number };
  },
  kind: "owned" | "shared",
  role?: string,
) {
  return {
    id: doc.id,
    title: doc.title,
    updatedAt: doc.updatedAt,
    createdAt: doc.createdAt,
    kind,
    role: kind === "owned" ? "owner" : role ?? "editor",
    owner: doc.owner,
    shareCount: doc._count.shares,
    attachmentCount: doc._count.attachments,
  };
}
