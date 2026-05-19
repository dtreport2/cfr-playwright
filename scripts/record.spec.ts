/* eslint-disable playwright/no-wait-for-timeout -- Fixed waits keep recorded videos usable on slow or noisy page loads. */
import { copyFile, mkdir } from "node:fs/promises";
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

test.use({ video: "on" });
test.setTimeout(150_000);

test("records navigation through CryptoFaxReport pages", async ({
  page,
}, testInfo) => {
  await mkdir("videos", { recursive: true });

  for (const pagePath of paths) {
    await page.goto(`https://cryptofaxreport.com${pagePath}`);
    await expect(page.locator("body")).toBeVisible();
    await page.waitForTimeout(4_000);
    await scrollToBottom(page);
    await page.waitForTimeout(5_000);
  }

  const video = page.video();
  await page.close();
  await copyFile(
    await video!.path(),
    path.join(
      "videos",
      `${deviceForFilename(testInfo.project.name)}-${timestamp}.webm`,
    ),
  );
});

async function scrollToBottom(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const scrollingElement =
        document.scrollingElement ?? document.documentElement;
      const scrollDistance = 80;
      const intervalMs = 16;

      const interval = window.setInterval(() => {
        const maxScrollTop = scrollingElement.scrollHeight - window.innerHeight;
        scrollingElement.scrollTop = Math.min(
          scrollingElement.scrollTop + scrollDistance,
          maxScrollTop,
        );

        if (scrollingElement.scrollTop >= maxScrollTop) {
          window.clearInterval(interval);
          resolve();
        }
      }, intervalMs);
    });
  });
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
