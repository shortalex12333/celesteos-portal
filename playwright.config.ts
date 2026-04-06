import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: 1,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Mock tests:
  //   cd Cloud_PMS/apps/api && MOCK_PORT=8002 python3 tests/mock_import_server.py
  //   cd celesteos-portal && VITE_IMPORT_API_URL=http://localhost:8002 npm run dev -- --port 3001
  //   npx playwright test e2e/import-flow.spec.ts
  //
  // Production smoke test (hits real pipeline-core.int.celeste7.ai):
  //   cd celesteos-portal && VITE_IMPORT_API_URL=https://pipeline-core.int.celeste7.ai npm run dev -- --port 3001
  //   npx playwright test e2e/production-smoke.spec.ts
});
