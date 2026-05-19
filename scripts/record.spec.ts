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

test("records navigation through CryptoFaxReport pages", async ({
  page,
}, testInfo) => {
  await mkdir("videos", { recursive: true });

  for (const pagePath of paths) {
    await page.goto(`https://cryptofaxreport.com${pagePath}`);
    await expect(page.locator("body")).toBeVisible();
    await scrollToBottom(page);
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
      const scrollDistance = 500;
      const intervalMs = 100;
      let scrolled = 0;

      const interval = window.setInterval(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        window.scrollBy(0, scrollDistance);
        scrolled += scrollDistance;

        if (scrolled >= scrollHeight - window.innerHeight) {
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
