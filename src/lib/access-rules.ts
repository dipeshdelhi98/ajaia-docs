export type AccessDecision = {
  canView: boolean;
  canEdit: boolean;
  reason: "owner" | "shared" | "denied";
};

/**
 * Pure access rules used by both the API and tests.
 * Owners can view and edit. Shared users can view (and currently also edit
 * so collaboration is usable); the product still distinguishes owned vs shared.
 */
export function decideAccess(params: {
  userId: string;
  ownerId: string;
  sharedUserIds: string[];
}): AccessDecision {
  if (params.userId === params.ownerId) {
    return { canView: true, canEdit: true, reason: "owner" };
  }
  if (params.sharedUserIds.includes(params.userId)) {
    return { canView: true, canEdit: true, reason: "shared" };
  }
  return { canView: false, canEdit: false, reason: "denied" };
}

export function canShare(params: { userId: string; ownerId: string }) {
  return params.userId === params.ownerId;
}
