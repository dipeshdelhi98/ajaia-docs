import { describe, expect, it } from "vitest";
import { canShare, decideAccess } from "./access-rules";

describe("document access", () => {
  const owner = "user-alex";
  const jordan = "user-jordan";
  const sam = "user-sam";

  it("lets the owner view, edit, and share", () => {
    const access = decideAccess({
      userId: owner,
      ownerId: owner,
      sharedUserIds: [jordan],
    });
    expect(access).toEqual({ canView: true, canEdit: true, reason: "owner" });
    expect(canShare({ userId: owner, ownerId: owner })).toBe(true);
  });

  it("lets a shared user view and edit but not share", () => {
    const access = decideAccess({
      userId: jordan,
      ownerId: owner,
      sharedUserIds: [jordan],
    });
    expect(access.reason).toBe("shared");
    expect(access.canView).toBe(true);
    expect(access.canEdit).toBe(true);
    expect(canShare({ userId: jordan, ownerId: owner })).toBe(false);
  });

  it("denies users who are neither owner nor shared", () => {
    const access = decideAccess({
      userId: sam,
      ownerId: owner,
      sharedUserIds: [jordan],
    });
    expect(access).toEqual({ canView: false, canEdit: false, reason: "denied" });
  });
});
