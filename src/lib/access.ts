import { ForbiddenError, NotFoundError, type SessionUser } from "./auth";
import { prisma } from "./db";

export async function getAccessibleDocument(documentId: string, user: SessionUser) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      owner: { select: { id: true, email: true, name: true } },
      shares: {
        include: { user: { select: { id: true, email: true, name: true } } },
      },
      attachments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!document) {
    throw new NotFoundError("Document not found.");
  }

  const isOwner = document.ownerId === user.id;
  const isShared = document.shares.some((share) => share.userId === user.id);

  if (!isOwner && !isShared) {
    throw new ForbiddenError("You do not have access to this document.");
  }

  return { document, isOwner, isShared };
}
