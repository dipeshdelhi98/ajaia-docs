import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getAccessibleDocument } from "@/lib/access";
import { canShare, parseShareRole } from "@/lib/access-rules";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { findUserByEmail } from "@/lib/users";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { document } = await getAccessibleDocument(id, user);

    if (!canShare({ userId: user.id, ownerId: document.ownerId })) {
      return NextResponse.json({ error: "Only the owner can share this document." }, { status: 403 });
    }

    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const role = parseShareRole(body.role) ?? "editor";
    if (!email) {
      return NextResponse.json({ error: "Enter an email address." }, { status: 400 });
    }

    const target = await findUserByEmail(email);
    if (!target) {
      return NextResponse.json(
        { error: "No seeded user has that email. Try jordan@ajaia.dev or sam@ajaia.dev." },
        { status: 404 },
      );
    }

    if (target.id === user.id) {
      return NextResponse.json({ error: "You already own this document." }, { status: 400 });
    }

    const existing = document.shares.find((s) => s.userId === target.id);
    if (existing) {
      return NextResponse.json({ error: "That person already has access." }, { status: 409 });
    }

    const share = await prisma.documentShare.create({
      data: { documentId: document.id, userId: target.id, role },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    return NextResponse.json({ id: share.id, role: share.role, user: share.user }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { document } = await getAccessibleDocument(id, user);

    if (!canShare({ userId: user.id, ownerId: document.ownerId })) {
      return NextResponse.json({ error: "Only the owner can change sharing." }, { status: 403 });
    }

    const body = await request.json();
    const userId = String(body.userId ?? "");
    const role = parseShareRole(body.role);
    if (!userId || !role) {
      return NextResponse.json({ error: "userId and a role of editor or viewer are required." }, { status: 400 });
    }

    const updated = await prisma.documentShare.updateMany({
      where: { documentId: document.id, userId },
      data: { role },
    });
    if (updated.count === 0) {
      return NextResponse.json({ error: "That person does not have access." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, role });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { document } = await getAccessibleDocument(id, user);

    if (!canShare({ userId: user.id, ownerId: document.ownerId })) {
      return NextResponse.json({ error: "Only the owner can change sharing." }, { status: 403 });
    }

    const body = await request.json();
    const userId = String(body.userId ?? "");
    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    await prisma.documentShare.deleteMany({
      where: { documentId: document.id, userId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
