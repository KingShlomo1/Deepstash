import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
    // Use the pre-installed browser when one is provided (this repo's remote
    // environments ship Chromium at PLAYWRIGHT_BROWSERS_PATH), otherwise fall
    // back to whatever `playwright install` put in place, as CI does.
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH || undefined,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    },
  },
  // A phone-sized viewport rather than a full device descriptor: this app is
  // mobile-first, and isMobile emulation is not dependable on headless shells.
  projects: [{ name: "mobile", use: { viewport: { width: 390, height: 844 }, hasTouch: true } }],
  webServer: {
    command: "npm run preview",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
