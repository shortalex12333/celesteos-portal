import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: 1,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Start servers manually before running tests:
  // 1. cd Cloud_PMS/apps/api && MOCK_PORT=8002 python3 tests/mock_import_server.py
  // 2. cd celesteos-portal && VITE_IMPORT_API_URL=http://localhost:8002 npm run dev
  // Then: npx playwright test
});
