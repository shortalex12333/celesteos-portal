import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Production Smoke Test
 * =====================
 * Tests the REAL import flow: local frontend → production pipeline-core.int.celeste7.ai
 * Uses a real JWT signed with IMPORT_JWT_SECRET.
 * Verifies JSON content, not just status codes.
 */

const IMPORT_API = "https://pipeline-core.int.celeste7.ai";
const TEST_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGNlbGVzdGU3LmFpIiwieWFjaHRfaWQiOiI4NWZlMTExOS1iMDRjLTQxYWMtODBmMS04MjlkMjMzMjI1OTgiLCJ5YWNodF9uYW1lIjoiTS9ZIFRlc3QgWWFjaHQiLCJzY29wZSI6ImltcG9ydCIsImF1ZCI6ImNlbGVzdGUtaW1wb3J0IiwiaWF0IjoxNzc1NTAzNDc2LCJleHAiOjE3NzU1MTc4NzZ9.5VtMr1apO3Pb2MUr4KbXoi_QHg3OEI0Fox0VNAqkOzk";
const IDEA_FIXTURE = path.resolve(
  __dirname,
  "../../Documents/Cloud_PMS/apps/api/tests/fixtures/import_samples/idea_yacht_equipment.csv"
);

function seedAuth(page: any) {
  return page.evaluate((jwt: string) => {
    sessionStorage.setItem("celeste_import_token", jwt);
    sessionStorage.setItem("celeste_yacht_name", "M/Y Test Yacht");
    sessionStorage.setItem("celeste_user_email", "test@celeste7.ai");
  }, TEST_JWT);
}

test.describe("Production Smoke Test — Real Backend", () => {
  test.setTimeout(120_000); // 2 minutes — real API calls

  test("Auth gate: /import redirects to / without token", async ({ page }) => {
    await page.goto("/import");
    await page.waitForURL("/");
    expect(page.url()).toContain("/");
  });

  test("Auth gate: /import loads with token", async ({ page }) => {
    await page.goto("/");
    await seedAuth(page);
    await page.goto("/import");

    // Glass header should show yacht name
    const header = page.locator(".glass-hdr-meta");
    await expect(header).toContainText("M/Y Test Yacht");
  });

  test("Upload → Detect → Mapping: full flow with IDEA fixture", async ({
    page,
  }) => {
    await page.goto("/");
    await seedAuth(page);
    await page.goto("/import");

    // Select IDEA Yacht source
    await page.selectOption("#source-select", "idea_yacht");

    // Upload the IDEA equipment CSV
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(IDEA_FIXTURE);

    // Verify file card appeared with correct filename
    const fileCard = page.locator(".file-card").first();
    await expect(fileCard).toContainText("idea_yacht_equipment.csv");

    // Click upload
    await page.click("button.btn-brand:has-text('Upload and analyse')");

    // Wait for redirect to /import/:sessionId — real API call
    await page.waitForURL(/\/import\/[a-f0-9-]+/, { timeout: 30_000 });

    // Should show detecting or mapping screen
    // Wait for mapping screen (detection + column matching happens server-side)
    const mappingHeader = page.locator(".glass-hdr-title:has-text('Column mapping')");
    await expect(mappingHeader).toBeVisible({ timeout: 60_000 });

    // ── VERIFY DETECTION CONTENT (not just "page loaded") ──

    // Match badge should show matched count
    const matchBadge = page.locator(".match-badge");
    await expect(matchBadge).toBeVisible();
    const badgeText = await matchBadge.textContent();
    expect(badgeText).toMatch(/\d+ of 16 matched/);

    // Verify 16 mapping rows rendered (one per CSV column)
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBe(16);

    // Verify first source column name is from the CSV
    const firstSourceCol = rows.first().locator("td:first-child");
    const firstColText = await firstSourceCol.textContent();
    expect(firstColText?.trim()).toBe("EQUIP_ID");

    // Verify sample values contain real data (not empty)
    const sampleCell = rows.nth(2).locator("td:last-child"); // EQUIP_NAME row
    const sampleText = await sampleCell.textContent();
    expect(sampleText).toBeTruthy();
    expect(sampleText!.length).toBeGreaterThan(5);

    // Verify green rows exist (high confidence matches)
    const greenRows = page.locator("tr.map-row-green");
    const greenCount = await greenRows.count();
    expect(greenCount).toBeGreaterThanOrEqual(8); // Most IDEA columns are known

    // Verify file metadata shows correct detection
    const dateFormat = page.locator("text=DD-MMM-YYYY");
    await expect(dateFormat).toBeVisible();

    // Verify encoding shown
    const encoding = page.locator("text=utf-8");
    await expect(encoding).toBeVisible();

    // Verify row count shown
    const rowCountText = page.locator("text=15 rows");
    await expect(rowCountText).toBeVisible();

    console.log("✅ Detection verified: 16 columns, 15 rows, DD-MMM-YYYY, utf-8");
    console.log(`✅ Match badge: ${badgeText}`);
    console.log(`✅ Green rows: ${greenCount}`);
    console.log(`✅ Mapping rows: ${rowCount}`);
  });

  test("Confirm mapping → Dry run preview: content verification", async ({
    page,
  }) => {
    await page.goto("/");
    await seedAuth(page);
    await page.goto("/import");

    // Upload flow
    await page.selectOption("#source-select", "idea_yacht");
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(IDEA_FIXTURE);
    await page.click("button.btn-brand:has-text('Upload and analyse')");
    await page.waitForURL(/\/import\/[a-f0-9-]+/, { timeout: 30_000 });

    // Wait for mapping screen
    await page.locator(".glass-hdr-title:has-text('Column mapping')").waitFor({ timeout: 60_000 });

    // Click confirm mapping
    const confirmBtn = page.locator("button.btn-brand:has-text('Confirm mapping')");
    await expect(confirmBtn).toBeEnabled({ timeout: 10_000 });
    await confirmBtn.click();

    // Should show loading overlay then transition to preview
    const previewHeader = page.locator(".glass-hdr-title:has-text('Preview')");
    await expect(previewHeader).toBeVisible({ timeout: 60_000 });

    // ── VERIFY PREVIEW CONTENT ──

    // Total records should be 15
    const metaText = await page.locator(".glass-hdr-meta").textContent();
    expect(metaText).toContain("15 records");

    // Equipment domain section should exist
    const equipmentSection = page.locator("text=Equipment");
    await expect(equipmentSection).toBeVisible();

    // Commit button should be enabled (can_commit: true expected)
    const commitBtn = page.locator("button.btn-brand:has-text('Commit import')");
    await expect(commitBtn).toBeEnabled({ timeout: 5_000 });

    console.log("✅ Preview verified: 15 records, equipment domain visible, commit enabled");
    console.log(`✅ Header meta: ${metaText}`);

    // DO NOT commit — this is a smoke test, not a data migration
    // Committing would write to the real production tenant DB
    console.log("⏸ Stopping before commit — smoke test complete, no data written");
  });
});
