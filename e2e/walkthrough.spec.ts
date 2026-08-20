import { test } from "@playwright/test";
import path from "path";

const APP = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001";

test("assignment walkthrough", async ({ page }) => {
  test.setTimeout(180_000);
  const banner = async (text: string) => {
    await page.evaluate((message) => {
      let el = document.getElementById("walkthrough-banner");
      if (!el) {
        el = document.createElement("div");
        el.id = "walkthrough-banner";
        el.setAttribute(
          "style",
          "position:fixed;z-index:99999;left:16px;right:16px;bottom:16px;background:#1f4b3a;color:white;padding:12px 16px;border-radius:12px;font:600 16px DM Sans,system-ui;box-shadow:0 8px 24px rgba(0,0,0,.25)",
        );
        document.body.appendChild(el);
      }
      el.textContent = message;
    }, text);
    await page.waitForTimeout(1200);
  };

  await page.goto(`${APP}/login`);
  await banner("Ajaia Docs — scoped editor: create, format, import, share.");
  await page.getByRole("button", { name: "Alex Rivera" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForURL("**/docs");
  await banner("Alex owns documents. Jordan already has a shared kickoff note.");

  await page.getByRole("link", { name: /Team kickoff notes/ }).click();
  await page.waitForURL("**/docs/**");
  await banner("Rich text: headings, bold, lists. Title saves on blur.");

  const editor = page.locator(".ProseMirror");
  await editor.click();
  await page.getByRole("button", { name: "H2" }).click();
  await page.keyboard.type(" Reviewer demo");
  await page.getByRole("button", { name: "Bold" }).click();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Bullets" }).click();
  await page.keyboard.type("Formatting persists after refresh");
  await page.waitForTimeout(1200);

  const title = page.locator("header input").first();
  await title.fill("Team kickoff notes (demo)");
  await title.blur();
  await page.waitForTimeout(800);
  await page.reload();
  await banner("Refresh: title and formatting are still here.");
  await page.waitForTimeout(1500);

  await page.getByRole("link", { name: "← Docs" }).click();
  await page.waitForURL("**/docs");
  await banner("Import .txt, .md, or .docx — creates an editable document.");

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(path.join(process.cwd(), "samples", "kickoff.md"));
  await page.waitForURL("**/docs/**");
  await page.waitForTimeout(1500);
  await page.getByRole("link", { name: "← Docs" }).click();

  await page.getByRole("link", { name: /Team kickoff notes/ }).first().click();
  await page.getByRole("button", { name: "Share" }).click();
  await page.locator('input[placeholder="jordan@ajaia.dev"]').fill("sam@ajaia.dev");
  await page.getByRole("button", { name: "Invite" }).click();
  await banner("Sam is invited. Only the owner can share or delete.");
  await page.getByRole("button", { name: "Close" }).click();

  await page.getByRole("link", { name: "← Docs" }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL("**/login");

  await page.getByRole("button", { name: "Sam Okonkwo" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForURL("**/docs");
  await banner("Sam sees it under Shared with me — not Owned.");
  await page.waitForTimeout(2000);

  await page.getByRole("button", { name: "Sign out" }).click();
  await page.getByRole("button", { name: "Jordan Chen" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForURL("**/docs");
  await banner("Jordan already had Team kickoff notes from seed data.");
  await page.waitForTimeout(2000);

  await banner("Cut: live cursors, comments, history. AI: Cursor for scaffolding; access rules and scope were human.");
  await page.waitForTimeout(2500);
});
