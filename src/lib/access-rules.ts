export type ShareRole = "editor" | "viewer";

export type AccessDecision = {
  canView: boolean;
  canEdit: boolean;
  reason: "owner" | "editor" | "viewer" | "denied";
};

export function parseShareRole(value: unknown): ShareRole | null {
  if (value === "editor" || value === "viewer") return value;
  return null;
}

/**
 * Owners can view, edit, and share.
 * Editors can view and edit.
 * Viewers can only view.
 */
export function decideAccess(params: {
  userId: string;
  ownerId: string;
  shares: { userId: string; role: string }[];
}): AccessDecision {
  if (params.userId === params.ownerId) {
    return { canView: true, canEdit: true, reason: "owner" };
  }
  const share = params.shares.find((item) => item.userId === params.userId);
  if (!share) {
    return { canView: false, canEdit: false, reason: "denied" };
  }
  if (share.role === "viewer") {
    return { canView: true, canEdit: false, reason: "viewer" };
  }
  return { canView: true, canEdit: true, reason: "editor" };
}

export function canShare(params: { userId: string; ownerId: string }) {
  return params.userId === params.ownerId;
}
