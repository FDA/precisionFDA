/**
 * Shared Page Fixtures for Serial Tests
 * 
 * Provides worker-scoped fixtures that share a single browser context and page
 * across all tests in a file. This is ideal for serial test suites where tests
 * depend on each other and benefit from faster SPA navigation.
 * 
 * @example
 * ```ts
 * import { test, expect } from './fixtures/shared-page'
 * 
 * test.describe.configure({ mode: 'serial' })
 * 
 * test.describe('My Serial Tests', () => {
 *   test('first test', async ({ page, app }) => {
 *     await app.ensureRoute('/home/files')
 *     // ...
 *   })
 * 
 *   test('second test', async ({ page, app }) => {
 *     await app.ensureRoute('/home/files')  // Fast SPA navigation
 *     // ...
 *   })
 * })
 * ```
 * 
 * SPA Navigation Pattern:
 * 1. Use worker-scoped fixtures for page and app (shared across all tests)
 * 2. Use app.ensureRoute() at the start of each test - it automatically:
 *    - Does a full goto() if the page hasn't been initialized yet (first test or individual run)
 *    - Uses fast SPA navigation if already initialized (serial test runs)
 * 3. Tests can run individually or in serial mode without modification
 */

import { test as base, Page, BrowserContext } from 'playwright/test'
import { setupPageStyles } from './e2e-styles'
import { PlaywrightFixture } from './playwright-fixture'

/**
 * Extended test with worker-scoped shared page fixtures.
 * 
 * Fixtures:
 * - `page` - Shared Playwright page with E2E styles (disabled animations, non-blocking toasts)
 * - `app` - PlaywrightFixture instance for SPA-friendly navigation (preserves _initialized state)
 * - `sharedContext` - Worker-scoped browser context
 * - `sharedPage` - Worker-scoped page (same as `page`)
 */
export const test = base.extend<
  { app: PlaywrightFixture },
  { sharedContext: BrowserContext; sharedPage: Page }
>({
  // Worker-scoped context - lives for all tests in this file
  sharedContext: [async ({ browser }, use) => {
    const context = await browser.newContext()
    await use(context)
    await context.close()
  }, { scope: 'worker' }],

  // Worker-scoped page - lives for all tests in this file  
  sharedPage: [async ({ sharedContext }, use) => {
    const page = await sharedContext.newPage()
    setupPageStyles(page)
    await use(page)
  }, { scope: 'worker' }],

  // Override the default page fixture to use our shared page
  page: async ({ sharedPage }, use) => {
    await use(sharedPage)
  },

  // Worker-scoped app fixture - preserves _initialized state across tests
  app: [async ({ sharedPage }, use) => {
    const app = new PlaywrightFixture(sharedPage)
    await use(app)
  }, { scope: 'worker' }],
})

export { expect } from 'playwright/test'
export { PlaywrightFixture, doAndWait } from './playwright-fixture'
