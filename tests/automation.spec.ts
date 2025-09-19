import { test, expect, BrowserContext, Page } from "@playwright/test";
import { chromium } from "patchright";

function randomTimeout(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

test("Search automation", async ({}) => {
  const context = await chromium.launchPersistentContext(
    `user-data/user-data-dir-${Date.now()}`,
    {
      channel: "chrome",
      headless: false,
      viewport: null,
    }
  );

  const page = await context.newPage();
  await page.goto("https://www.google.com/");

  await randomTimeout(1000, 2000);

  const element = page.locator('text="Reject all"');
  await element.scrollIntoViewIfNeeded();
  await element.click();

  await randomTimeout(1732, 2732);

  const textarea = page.locator('textarea[role="combobox"]');
  const box = await textarea.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 3, box.y + box.height / 4);
    await randomTimeout(1669, 2669);
    await page.mouse.click(box.x + box.width / 3, box.y + box.height / 4);
  } else {
    console.log("Textarea not found.");
  }

  await randomTimeout(1875, 2875);

  for (const char of "automation") {
    await page.keyboard.press(char);
    await randomTimeout(50, 150);
  }

  await randomTimeout(702, 1458);

  await page.keyboard.press("Enter");

  await page.waitForLoadState("domcontentloaded");
  await randomTimeout(1000, 2000);
  await page.screenshot({ path: "test-results/wiki1.png" });

  const firstWikiLink = page.locator('a[href*="wiki/Automation"] h3').first();
  await firstWikiLink.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/wiki2.png" });

  await firstWikiLink.click();

  await page.waitForLoadState("domcontentloaded");
  await page.screenshot({ path: "test-results/wiki3.png" });

  const firstProcessParagraph = page.locator(
    'p:has-text("first"):has-text("industrial process")'
  );
  const text = await firstProcessParagraph.textContent();

  if (text) {
    console.log("Paragraph found successfully: ", text);
  } else {
    console.log("Paragraph not found.");
  }

  const years = extractYears(text || "");
  if (years.length === 1) {
    console.log(`First industrial process was done in ${years[0]} year.`);
  } else if (years.length > 0) {
    console.log(`Years found: ${years.join(", ")}`);

    years.forEach((year) => {
      const regex = new RegExp(
        `\\b${year}\\b[^.]*?first[^.]*?industrial process[^.]*?|` + // Pattern 1: year > first > industrial process
          `\\b${year}\\b[^.]*?industrial process[^.]*?first[^.]*?|` + // Pattern 2: year > industrial process > first
          `industrial process[^.]*?first[^.]*?\\b${year}\\b[^.]*?|` + // Pattern 3: industrial process > first > year
          `industrial process[^.]*?\\b${year}\\b[^.]*?first[^.]*?|` + // Pattern 4: industrial process > year > first
          `first[^.]*?\\b${year}\\b[^.]*?industrial process[^.]*?|` + // Pattern 5: first > year > industrial process
          `first[^.]*?industrial process[^.]*?\\b${year}\\b[^.]*?`, // Pattern 6: first > industrial process > year
        "i"
      );
      if (regex.test(text || "")) {
        console.log(`First industrial process was done in ${year} year.`);
      } else {
        console.log(
          `${year} year is not the year of the first industrial process.`
        );
      }
    });
  } else {
    console.log("No year found for the first industrial process.");
  }

  await firstProcessParagraph.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/wiki4.png" });

  await page.close();
});

function extractYears(sentence: string): string[] {
  const matches = sentence.match(/\b\d{4}\b/g);
  return matches ? matches : [];
}
