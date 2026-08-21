import { test, expect } from "@playwright/test";

/** Block third-party media so the suite never depends on the network. */
async function offline(page) {
  await page.route(/picsum\.photos|youtube|instagram|tiktok|googleapis|vimeo/, (r) => r.abort());
}

/** Get past the first-run interest picker. */
async function onboard(page, { skip = false } = {}) {
  await page.goto("/");
  const onboard = page.locator("#onboard.show");
  await expect(onboard).toBeVisible();
  if (skip) {
    await page.click("#oskip");
  } else {
    const chips = page.locator("#onboard .ochip");
    for (let i = 0; i < 3; i++) await chips.nth(i).click();
    await page.click("#ostart");
  }
  await expect(onboard).toBeHidden();
}

test.beforeEach(async ({ page }) => { await offline(page); });

test("first run shows the interest picker and personalises the feed", async ({ page }) => {
  await onboard(page);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("apex_v1")));
  expect(saved.interests).toHaveLength(3);
  expect(saved.onboarded).toBe(true);
});

test("the picker can be skipped", async ({ page }) => {
  await onboard(page, { skip: true });
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("apex_v1")));
  expect(saved.interests).toEqual([]);
});

test("every tab renders content", async ({ page }) => {
  await onboard(page);
  for (const tab of ["home", "learn", "train", "watch", "you"]) {
    await page.click(`.tab[data-tab="${tab}"]`);
    const view = page.locator(`#v-${tab}`);
    await expect(view).toHaveClass(/active/);
    await expect.poll(() => view.innerHTML().then((h) => h.trim().length)).toBeGreaterThan(500);
  }
});

test("the learn feed builds cards and they are interactive", async ({ page }) => {
  await onboard(page);
  await page.click('.tab[data-tab="learn"]');
  const cards = page.locator("#feed .card");
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThan(50);

  await cards.first().locator('[data-a="like"]').click();
  await cards.first().locator('[data-a="save"]').click();

  const s = await page.evaluate(() => JSON.parse(localStorage.getItem("apex_v1")));
  expect(Object.values(s.likes).filter(Boolean).length).toBe(1);
  expect(Object.values(s.saves).filter(Boolean).length).toBe(1);
  expect(s.xp).toBeGreaterThan(0);
});

test("progress survives a reload", async ({ page }) => {
  await onboard(page);
  await page.click('.tab[data-tab="learn"]');
  await page.locator("#feed .card").first().locator('[data-a="save"]').click();
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem("apex_v1")).xp);

  await page.reload();
  await expect(page.locator("#onboard.show")).toBeHidden();
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem("apex_v1")).xp);
  expect(after).toBeGreaterThanOrEqual(before);
});

test("a workout runs its interval timer", async ({ page }) => {
  await onboard(page);
  await page.click('.tab[data-tab="train"]');
  await page.locator("#v-train [data-start]").first().click();
  const timer = page.locator("#timer.show");
  await expect(timer).toBeVisible();
  await expect(page.locator("#cnt")).toBeVisible();
});

test("the page never scrolls sideways", async ({ page }) => {
  await onboard(page);
  for (const tab of ["home", "train", "watch", "you"]) {
    await page.click(`.tab[data-tab="${tab}"]`);
    const overflow = await page.evaluate(() => {
      const el = document.scrollingElement || document.body;
      return el.scrollWidth - el.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test("no console errors on a full pass", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource|ERR_/.test(m.text())) errors.push(m.text());
  });
  await onboard(page);
  for (const tab of ["home", "learn", "train", "watch", "you"]) await page.click(`.tab[data-tab="${tab}"]`);
  expect(errors).toEqual([]);
});
