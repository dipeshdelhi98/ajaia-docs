import { describe, expect, it } from "vitest";
import { canShare, decideAccess, parseShareRole } from "./access-rules";

describe("document access", () => {
  const owner = "user-alex";
  const jordan = "user-jordan";
  const sam = "user-sam";
  const shares = [
    { userId: jordan, role: "editor" },
    { userId: sam, role: "viewer" },
  ];

  it("lets the owner view, edit, and share", () => {
    const access = decideAccess({ userId: owner, ownerId: owner, shares });
    expect(access).toEqual({ canView: true, canEdit: true, reason: "owner" });
    expect(canShare({ userId: owner, ownerId: owner })).toBe(true);
  });

  it("lets an editor view and edit but not share", () => {
    const access = decideAccess({ userId: jordan, ownerId: owner, shares });
    expect(access).toEqual({ canView: true, canEdit: true, reason: "editor" });
    expect(canShare({ userId: jordan, ownerId: owner })).toBe(false);
  });

  it("lets a viewer read but not edit or share", () => {
    const access = decideAccess({ userId: sam, ownerId: owner, shares });
    expect(access).toEqual({ canView: true, canEdit: false, reason: "viewer" });
    expect(canShare({ userId: sam, ownerId: owner })).toBe(false);
  });

  it("denies users who are neither owner nor shared", () => {
    const access = decideAccess({
      userId: "stranger",
      ownerId: owner,
      shares,
    });
    expect(access).toEqual({ canView: false, canEdit: false, reason: "denied" });
  });

  it("accepts only editor or viewer roles", () => {
    expect(parseShareRole("editor")).toBe("editor");
    expect(parseShareRole("viewer")).toBe("viewer");
    expect(parseShareRole("admin")).toBeNull();
  });
});
