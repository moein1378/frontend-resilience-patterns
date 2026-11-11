import { expect, test } from "@playwright/test";

test("reviewer compares same-seed retries and inspects the attempt evidence", async ({
  page,
}) => {
  const apiRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes(":3001")) apiRequests.push(request.url());
  });
  await page.goto("/#/retry-lab");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Retry and Jitter Lab",
  );
  await page
    .getByRole("button", { name: "Run comparison", exact: true })
    .click();
  await expect(page.getByTestId("comparison-status")).toHaveText("completed", {
    timeout: 15000,
  });
  await expect(page.getByTestId("comparison-result-0")).toContainText(
    "20% (1/5)",
  );
  await expect(page.getByTestId("comparison-result-2")).toContainText(
    "Full jitter",
  );
  await expect(page.getByTestId("comparison-result-2")).toContainText(
    "100% (5/5)",
  );
  await page.getByTestId("comparison-result-2").locator("summary").click();
  await expect(
    page.getByTestId("comparison-result-2").getByRole("table"),
  ).toContainText("retry-scheduled");
  expect(apiRequests).toEqual([]);
  await page
    .getByRole("button", { name: "Reset comparison", exact: true })
    .click();
  await expect(page.getByTestId("comparison-status")).toHaveText("idle");
  await expect(page.getByTestId("comparison-result-0")).toHaveCount(0);
});

test("phone can replay and reset while authoring stays hidden", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/retry-lab");
  await expect(page.getByLabel("Comparison scenario")).toBeHidden();
  await expect(
    page.getByText("Phone view is read-only replay mode. Replay"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Run comparison", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reset comparison", exact: true })
    .click();
  await expect(page.getByTestId("comparison-status")).toHaveText("idle");
  await expect(page.getByTestId("comparison-result-0")).toHaveCount(0);
});
