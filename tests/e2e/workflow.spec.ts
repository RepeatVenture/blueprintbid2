import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("manual estimate, source review, immutable proposal and persistent save", async ({
  page,
}) => {
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { name: "Juniper Studio · Tenant improvement" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Inspect / edit" }).click();
  await page.getByLabel("Review status").selectOption("Confirmed");
  await page
    .getByRole("combobox", { name: "Responsibility", exact: true })
    .selectOption("Included by us");
  await page.getByRole("button", { name: "Save project", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved");
  await page.getByRole("tab", { name: "Proposal", exact: true }).click();
  await page.getByRole("button", { name: "Issue new version" }).click();
  await expect(page.getByLabel("Proposal version")).toHaveValue("1");
  const snapshot = await page.locator(".proposal-total").textContent();
  await page.getByRole("button", { name: "Save project", exact: true }).click();
  await page.reload();
  await page.getByRole("tab", { name: "Proposal", exact: true }).click();
  await page.getByLabel("Proposal version").selectOption("1");
  await expect(page.locator(".proposal-total")).toHaveText(snapshot!);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download issued PDF" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("proposal-v1.pdf");
  expect(await download.failure()).toBeNull();
});
test("marketing and demo meet automated accessibility checks", async ({
  page,
}) => {
  for (const route of ["/", "/demo"]) {
    await page.goto(route);
    if (route === "/demo")
      await expect(
        page.getByRole("heading", {
          name: "Juniper Studio · Tenant improvement",
        }),
      ).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    await page.screenshot({
      path: `test-results/${route === "/" ? "marketing" : "demo"}.png`,
      fullPage: true,
    });
  }
});
test("unconfigured auth fails honestly and wrong-origin PDF is rejected", async ({
  page,
  request,
}) => {
  await page.goto("/login");
  await expect(
    page.getByText("Hosted accounts are not configured.", { exact: false }),
  ).toBeVisible();
  const response = await request.post("/api/proposal", {
    headers: { origin: "https://attacker.invalid" },
    data: {},
  });
  expect(response.status()).toBe(400);
});

test("commercial review and evidence create reviewable scope", async ({
  page,
}) => {
  await page.goto("/demo");
  await page
    .getByRole("tab", { name: "Commercial review", exact: true })
    .click();
  await page.getByRole("button", { name: "Add allowance / alternate" }).click();
  await page.getByLabel("Customer description").fill("Glass allowance");
  await page.getByLabel("Unit cost ($), internal", { exact: true }).fill("500");
  await page.getByRole("tab", { name: "Proposal", exact: true }).click();
  await expect(page.locator(".paper")).toContainText("Glass allowance");
  await page.getByRole("tab", { name: "Documents", exact: true }).click();
  await page.getByRole("button", { name: "Find review candidates" }).click();
  await page
    .getByRole("button", { name: "Add to scope for review" })
    .first()
    .click();
  await expect(
    page.getByRole("textbox", { name: "Description", exact: true }),
  ).toHaveValue("Manual scope candidate");
  await expect(
    page.getByRole("combobox", { name: "Review status" }),
  ).toHaveValue("Needs review");
});
