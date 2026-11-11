import { expect, test } from "@playwright/test";

test("first reviewer can replay the seeded 503 baseline and reset it", async ({
  page,
}) => {
  const localApiRequests: string[] = [];
  page.on("request", (request) => {
    if (
      request.url().includes("localhost:3001") ||
      request.url().includes("127.0.0.1:3001")
    ) {
      localApiRequests.push(request.url());
    }
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Failures you can replay",
  );
  await page.getByRole("button", { name: "Run baseline experiment" }).click();
  await expect(page.getByTestId("run-status")).toContainText("completed");
  await expect(page.getByTestId("metrics-summary")).toContainText("20%");
  await expect(page.getByTestId("metrics-summary")).toContainText("5");
  await expect(page.getByTestId("failure-timeline")).toBeVisible();
  await expect(page.getByTestId("run-fingerprint")).toHaveText(
    "503 · 503 · 200 · 503 · 503",
  );
  const firstReplay = await page.getByTestId("run-fingerprint").textContent();

  await page.getByRole("button", { name: "Reset experiment" }).click();
  await expect(page.getByTestId("run-status")).toContainText("idle");
  await expect(page.getByTestId("timeline-empty")).toBeVisible();

  await page.getByRole("button", { name: "Run baseline experiment" }).click();
  await expect(page.getByTestId("run-status")).toContainText("completed");
  await expect(page.getByTestId("run-fingerprint")).toHaveText(
    firstReplay ?? "",
  );
  expect(localApiRequests).toEqual([]);
});

test("pattern catalog labels the circuit breaker as a Phase 03 preview", async ({
  page,
}) => {
  await page.goto("/#/patterns");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Resilience patterns",
  );
  await expect(page.getByText("Circuit Breaker Console")).toBeVisible();
  await expect(page.getByText("Phase 03 preview")).toBeVisible();
  await expect(
    page.getByText("not implemented", { exact: false }).first(),
  ).toBeVisible();
});

test("phone view exposes read-only replay and 44px actions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByText("Phone view is read-only replay mode"),
  ).toBeVisible();
  await expect(page.getByLabel("Failure scenario")).toBeHidden();
  const runButton = page.getByRole("button", {
    name: "Run baseline experiment",
  });
  const box = await runButton.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  await runButton.click();
  await expect(page.getByTestId("run-status")).toContainText("completed");
});
