import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

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
    await page.screenshot({
      fullPage: true,
      path: path.join(
        "screenshots",
        `${urlPathForFilename(pagePath)}-${deviceForFilename(testInfo.project.name)}-${timestamp}.png`,
      ),
    });
  });
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
