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
const pageSettledMs = 3_000;
const postScrollMs = 3_000;

test.use({ video: "on" });
test.setTimeout(150_000);

test("records navigation through CryptoFaxReport pages", async ({
  page,
}, testInfo) => {
  await mkdir("videos", { recursive: true });

  for (const pagePath of paths) {
    await page.goto(`https://cryptofaxreport.com${pagePath}`);
    await expect(page.locator("body")).toBeVisible();
    await page.waitForTimeout(pageSettledMs);
    await scrollToBottom(page);
    await page.waitForTimeout(postScrollMs);
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
      const scrollTarget = findScrollTarget();
      const scrollDistance = 100;
      const intervalMs = 16;
      let unchangedTicks = 0;

      const interval = window.setInterval(() => {
        const before = getScrollTop(scrollTarget);
        const maxScrollTop = getMaxScrollTop(scrollTarget);
        setScrollTop(
          scrollTarget,
          Math.min(before + scrollDistance, maxScrollTop),
        );
        scrollTarget.dispatchEvent(new Event("scroll", { bubbles: true }));

        const after = getScrollTop(scrollTarget);
        unchangedTicks = after === before ? unchangedTicks + 1 : 0;

        if (after >= maxScrollTop || unchangedTicks > 10) {
          window.clearInterval(interval);
          resolve();
        }
      }, intervalMs);
    });

    function findScrollTarget() {
      const candidates = [
        document.scrollingElement,
        ...document.querySelectorAll("*"),
      ]
        .filter((element): element is Element => element instanceof Element)
        .filter((element) => element.scrollHeight > element.clientHeight + 1)
        .sort((a, b) => getMaxScrollTop(b) - getMaxScrollTop(a));

      return candidates[0] ?? document.documentElement;
    }

    function getScrollTop(element: Element) {
      return element === document.scrollingElement
        ? window.scrollY
        : element.scrollTop;
    }

    function setScrollTop(element: Element, scrollTop: number) {
      if (element === document.scrollingElement) {
        window.scrollTo(0, scrollTop);
        return;
      }

      element.scrollTop = scrollTop;
    }

    function getMaxScrollTop(element: Element) {
      const viewportHeight =
        element === document.scrollingElement
          ? window.innerHeight
          : element.clientHeight;

      return Math.max(0, element.scrollHeight - viewportHeight);
    }
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
