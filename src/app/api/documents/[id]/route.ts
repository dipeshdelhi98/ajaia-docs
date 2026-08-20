import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getAccessibleDocument } from "@/lib/access";
import { canShare, decideAccess } from "@/lib/access-rules";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { document, isOwner } = await getAccessibleDocument(id, user);
    const access = decideAccess({
      userId: user.id,
      ownerId: document.ownerId,
      sharedUserIds: document.shares.map((s) => s.userId),
    });

    return NextResponse.json({
      id: document.id,
      title: document.title,
      content: JSON.parse(document.content),
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      owner: document.owner,
      isOwner,
      canShare: canShare({ userId: user.id, ownerId: document.ownerId }),
      canEdit: access.canEdit,
      shares: document.shares.map((s) => ({
        id: s.id,
        user: s.user,
      })),
      attachments: document.attachments,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { document } = await getAccessibleDocument(id, user);
    const access = decideAccess({
      userId: user.id,
      ownerId: document.ownerId,
      sharedUserIds: document.shares.map((s) => s.userId),
    });

    if (!access.canEdit) {
      return NextResponse.json({ error: "You cannot edit this document." }, { status: 403 });
    }

    const body = await request.json();
    const data: { title?: string; content?: string } = {};

    if (typeof body.title === "string") {
      const title = body.title.trim();
      if (!title) {
        return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
      }
      if (title.length > 180) {
        return NextResponse.json({ error: "Title is too long." }, { status: 400 });
      }
      data.title = title;
    }

    if (body.content !== undefined) {
      try {
        data.content = JSON.stringify(body.content);
      } catch {
        return NextResponse.json({ error: "Invalid document content." }, { status: 400 });
      }
    }

    const updated = await prisma.document.update({
      where: { id: document.id },
      data,
    });

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { document, isOwner } = await getAccessibleDocument(id, user);

    if (!isOwner) {
      return NextResponse.json({ error: "Only the owner can delete this document." }, { status: 403 });
    }

    await prisma.document.delete({ where: { id: document.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
