import { test, expect } from "@playwright/test";

async function onboard(page) {
  await page.route(/picsum\.photos|youtube|instagram|tiktok|googleapis|vimeo/, (r) => r.abort());
  await page.goto("/");
  await page.click("#oskip");
  await expect(page.locator("#onboard.show")).toBeHidden();
}

test("pinch zoom is not disabled", async ({ page }) => {
  await page.goto("/");
  const viewport = await page.getAttribute('meta[name="viewport"]', "content");
  // WCAG 1.4.4: blocking zoom fails "Resize text".
  expect(viewport).not.toMatch(/user-scalable\s*=\s*no/);
  expect(viewport).not.toMatch(/maximum-scale\s*=\s*1\b/);
});

test("clickable rows are reachable and operable by keyboard", async ({ page }) => {
  await onboard(page);
  await page.click('.tab[data-tab="home"]');

  const rows = page.locator("#v-home [data-explore], #v-home [data-open-story], #v-home [data-goto]");
  const n = await rows.count();
  expect(n).toBeGreaterThan(0);

  for (let i = 0; i < Math.min(n, 6); i++) {
    const row = rows.nth(i);
    expect(await row.getAttribute("tabindex")).toBe("0");
    expect(await row.getAttribute("role")).toBe("button");
  }
});

test("Enter activates a div-based row the same as a click", async ({ page }) => {
  await onboard(page);
  await page.click('.tab[data-tab="home"]');

  const tile = page.locator("#v-home [data-explore]").first();
  await expect(tile).toBeVisible();
  await expect(tile).toHaveAttribute("tabindex", "0");
  await tile.focus();
  await page.keyboard.press("Enter");
  // Exploring a subject switches to the Learn feed.
  await expect(page.locator("#v-learn")).toHaveClass(/active/);
});

test("a focus indicator is defined for interactive controls", async ({ page }) => {
  await onboard(page);
  // Headless shells do not run full Tab traversal, so assert the CSS contract
  // instead of the browser's :focus-visible heuristic: some rule must give
  // focused controls a non-zero outline. The app previously had none at all.
  const rules = await page.evaluate(() => {
    const found = [];
    for (const sheet of document.styleSheets) {
      let cssRules;
      try { cssRules = sheet.cssRules; } catch { continue; }
      for (const rule of cssRules) {
        const sel = rule.selectorText;
        if (sel && sel.includes(":focus-visible") && /outline/.test(rule.style.cssText)) {
          found.push({ sel, outline: rule.style.outline || rule.style.outlineWidth });
        }
      }
    }
    return found;
  });
  expect(rules.length).toBeGreaterThan(0);
  expect(rules.some((r) => !/^0/.test(r.outline || ""))).toBe(true);
});

test("the app honours a reduced-motion preference", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await onboard(page);
  const animated = await page.evaluate(() => {
    const el = document.querySelector(".tab");
    return getComputedStyle(el).transitionDuration;
  });
  expect(parseFloat(animated)).toBeLessThan(0.01);
});

test("every icon-only control has an accessible name", async ({ page }) => {
  await onboard(page);
  const unnamed = await page.evaluate(() =>
    [...document.querySelectorAll("button")]
      .filter((b) => b.offsetParent !== null)
      .filter((b) => !(b.textContent || "").trim() && !b.getAttribute("aria-label") && !b.getAttribute("title"))
      .map((b) => b.className || b.id || b.outerHTML.slice(0, 60))
  );
  expect(unnamed).toEqual([]);
});

test("the document declares a language and a title", async ({ page }) => {
  await page.goto("/");
  expect(await page.getAttribute("html", "lang")).toBeTruthy();
  expect(await page.title()).toBeTruthy();
});
