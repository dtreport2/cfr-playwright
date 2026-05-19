/* eslint-disable playwright/no-networkidle, playwright/no-wait-for-timeout -- The Expo/RNW app can report visible before async content has expanded. */
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, type Page, test } from "@playwright/test";

const paths = [
  "/",
  "/reports/bitcoin",
  "/research",
  "/market-info",
  "/news",
  "/blog",
  "/blog/fake-tokens-and-impersonation-scams-a-practical-crypto-safety-playbook",
];

const timestamp = timestampForFilename();

for (const pagePath of paths) {
  test(`captures ${pagePath}`, async ({ page }, testInfo) => {
    await mkdir("screenshots", { recursive: true });
    await page.goto(`https://cryptofaxreport.com${pagePath}`);

    await expect(page.locator("body")).toBeVisible();
    await page
      .waitForLoadState("networkidle", { timeout: 10_000 })
      .catch(() => undefined);
    await page.waitForTimeout(3_000);
    await captureBodyScreenshot(
      page,
      path.join(
        "screenshots",
        `${urlPathForFilename(pagePath)}-${deviceForFilename(testInfo.project.name)}-${timestamp}.png`,
      ),
    );
  });
}

async function captureBodyScreenshot(page: Page, screenshotPath: string) {
  const viewport = page.viewportSize();

  if (!viewport) {
    await page.screenshot({ path: screenshotPath });
    return;
  }

  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewportSize({
    height: bodyHeight,
    width: viewport.width,
  });

  await page.screenshot({ path: screenshotPath });
}

function urlPathForFilename(pagePath: string) {
  return pagePath === "/" ? "home" : pagePath.slice(1).replaceAll("/", "-");
}

function deviceForFilename(projectName: string) {
  return projectName.replaceAll(" ", "-");
}

function timestampForFilename() {
  return new Date()
    .toISOString()
    .replaceAll(":", "-")
    .replace(/\.\d{3}Z$/, "Z");
}
