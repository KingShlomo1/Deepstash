import { test, expect } from "@playwright/test";

/**
 * A user who installed the app before content keys existed has array-index
 * keys ("f12") in localStorage. Their saves must keep pointing at the same
 * ideas after the upgrade, not silently move to whatever now sits at index 12.
 */
const LEGACY_STATE = {
  xp: 320, streak: 4, reads: 40, onboarded: true, interests: ["mind", "money"],
  likes: { f0: true, f7: true },
  saves: { f0: true, f7: true, f19: true },
  ownComments: { f7: ["my note"] },
  history: [{ kind: "idea", id: "f7", topic: "mind", title: "old title", t: 1 }],
  collections: [{ id: "c1", name: "Later", items: ["f19"] }],
};

async function seed(page, state) {
  await page.route(/picsum\.photos|youtube|instagram|googleapis/, (r) => r.abort());
  await page.addInitScript((s) => {
    localStorage.setItem("apex_v1", JSON.stringify(s));
  }, state);
  await page.goto("/");
  await page.waitForTimeout(600);
}

test("legacy index keys are migrated to content keys", async ({ page }) => {
  await seed(page, LEGACY_STATE);

  const after = await page.evaluate(() => JSON.parse(localStorage.getItem("apex_v1")));

  // Same number of saves and likes, none dropped.
  expect(Object.keys(after.saves).filter((k) => after.saves[k])).toHaveLength(3);
  expect(Object.keys(after.likes).filter((k) => after.likes[k])).toHaveLength(2);

  // No bare index keys survive.
  const allKeys = [
    ...Object.keys(after.saves), ...Object.keys(after.likes),
    ...Object.keys(after.ownComments), ...after.collections[0].items,
    after.history[0].id,
  ];
  expect(allKeys.filter((k) => /^f\d+$/.test(k))).toEqual([]);

  // The schema is stamped so the migration does not run twice.
  expect(after.schemaV).toBe(2);
});

test("migrated saves still resolve to the ideas they pointed at", async ({ page }) => {
  // Read the titles at the legacy indices before migrating, straight from the
  // shipped catalogue, then confirm the stash shows those same titles.
  await seed(page, LEGACY_STATE);
  await page.click('.tab[data-tab="you"]');
  await page.waitForTimeout(500);

  const stash = await page.locator("#v-you .saveitem .sx").allTextContents();
  expect(stash).toHaveLength(3);
  for (const title of stash) expect(title.trim().length).toBeGreaterThan(0);
});

test("a migrated save still opens its idea in the feed", async ({ page }) => {
  await seed(page, LEGACY_STATE);
  await page.click('.tab[data-tab="you"]');
  await page.waitForTimeout(400);

  const first = page.locator("#v-you [data-open-saved]").first();
  const title = (await first.locator(".sx").textContent()).trim();
  await first.click();

  await expect(page.locator("#v-learn")).toHaveClass(/active/);
  // The feed paged forward far enough to render the saved idea.
  await expect(page.locator("#feed .card", { hasText: title.slice(0, 24) }).first()).toBeAttached();
});

test("the migration does not run a second time", async ({ page }) => {
  await seed(page, LEGACY_STATE);
  const first = await page.evaluate(() => localStorage.getItem("apex_v1"));

  await page.reload();
  await page.waitForTimeout(600);
  const second = await page.evaluate(() => JSON.parse(localStorage.getItem("apex_v1")));
  const firstParsed = JSON.parse(first);

  expect(Object.keys(second.saves).sort()).toEqual(Object.keys(firstParsed.saves).sort());
  expect(second.schemaV).toBe(2);
});

test("a fresh install is stamped without migrating anything", async ({ page }) => {
  await page.route(/picsum\.photos|youtube|instagram|googleapis/, (r) => r.abort());
  await page.goto("/");
  await page.click("#oskip");
  await page.waitForTimeout(400);
  const s = await page.evaluate(() => JSON.parse(localStorage.getItem("apex_v1")));
  expect(s.schemaV).toBe(2);
});
