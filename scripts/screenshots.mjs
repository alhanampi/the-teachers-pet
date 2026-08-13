import { chromium } from "playwright";
import { mkdirSync } from "fs";
import path from "path";

const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3212";
const TEACHER_EMAIL = process.env.SCREENSHOT_TEACHER_EMAIL;
const TEACHER_PASSWORD = process.env.SCREENSHOT_TEACHER_PASSWORD;
const OUT_DIR = path.resolve(import.meta.dirname, "..", "docs", "screenshots");

mkdirSync(OUT_DIR, { recursive: true });

async function completeCurrentExercise(page) {
  const nextOrSee = () => page.getByRole("button", { name: /^(Next|See results)$/ });

  const input = page.locator('input[placeholder="Type your answer"]');
  if ((await input.count()) > 0) {
    await input.fill("answer");
    await page.getByRole("button", { name: "Check" }).click();
    await nextOrSee().first().click();
    return;
  }

  const isMatching = (await page.locator("[data-right]").count()) > 0;

  const outsideHeader = "xpath=//button[not(ancestor::header)][not(@disabled)]";

  for (let i = 0; i < 10 && (await nextOrSee().count()) === 0; i++) {
    if (isMatching) {
      const left = page.locator(outsideHeader + "[not(@data-right)]").first();
      const right = page.locator("[data-right]:not([disabled])").first();
      if ((await left.count()) > 0) await left.click().catch(() => {});
      if ((await right.count()) > 0) await right.click().catch(() => {});
      await page.waitForTimeout(1400);
    } else {
      const buttons = page.locator(outsideHeader);
      const count = await buttons.count();
      let clicked = false;
      for (let b = 0; b < count; b++) {
        const text = (await buttons.nth(b).innerText()).trim();
        if (["Start over", "Try again", "Next", "See results", "Check"].includes(text)) continue;
        await buttons.nth(b).click();
        clicked = true;
        break;
      }
      if (!clicked) break;
      await page.waitForTimeout(300);
    }
  }

  await nextOrSee().first().click();
}

async function shootStudentFlow(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  await page.goto(BASE_URL + "/");
  await page.getByPlaceholder("Your name").fill("Sofia");
  await page.screenshot({ path: path.join(OUT_DIR, "student-welcome.png") });

  await page.getByRole("button", { name: "Start!" }).click();
  await page.screenshot({ path: path.join(OUT_DIR, "student-level-select.png") });

  await page.getByRole("button", { name: "A1" }).click();
  await page.screenshot({ path: path.join(OUT_DIR, "student-difficulty-select.png") });

  await page.getByRole("button", { name: /Easy/ }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, "student-exercise.png") });

  for (let i = 0; i < 5; i++) {
    const onSummary = await page.getByText("Great job,").count();
    if (onSummary > 0) break;
    await completeCurrentExercise(page);
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: path.join(OUT_DIR, "student-summary.png") });

  await context.close();
}

async function shootAdminFlow(browser) {
  const context = await browser.newContext({ viewport: { width: 480, height: 900 } });
  const page = await context.newPage();

  await page.goto(BASE_URL + "/auth");
  await page.screenshot({ path: path.join(OUT_DIR, "admin-auth.png") });

  await page.getByPlaceholder("Email").fill(TEACHER_EMAIL);
  await page.getByPlaceholder("Password").fill(TEACHER_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/admin/dashboard");
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, "admin-dashboard.png") });

  await page.getByText("Sofia").click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT_DIR, "admin-student-detail.png") });

  await page.goto(BASE_URL + "/admin/exercises");
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT_DIR, "admin-exercises.png") });

  await page.getByRole("button", { name: "+ New" }).click();
  await page.getByPlaceholder("Prompt (what the student sees)").fill("What color is a banana?");
  await page.getByPlaceholder("Option 1").fill("Yellow");
  await page.getByPlaceholder("Option 2").fill("Purple");
  await page.getByPlaceholder("Hint (optional, shown to the student later)").fill("It's a fruit");
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT_DIR, "admin-new-exercise.png") });

  await context.close();
}

const browser = await chromium.launch();
try {
  await shootStudentFlow(browser);
  if (TEACHER_EMAIL && TEACHER_PASSWORD) {
    await shootAdminFlow(browser);
  } else {
    console.warn("Skipping admin screenshots: set SCREENSHOT_TEACHER_EMAIL/PASSWORD env vars.");
  }
  console.log("Screenshots saved to", OUT_DIR);
} finally {
  await browser.close();
}
