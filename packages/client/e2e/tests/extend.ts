import { test as base, Page } from 'playwright/test'
import { setupPageStyles, PlaywrightFixture, doAndWait } from './fixtures'

// Re-export utilities for use in tests
export { PlaywrightFixture, doAndWait }

type Fixtures = {
  page: Page
  /** PlaywrightFixture instance for SPA navigation helpers */
  app: PlaywrightFixture
}

/**
 * Extended Playwright test with E2E styles and SPA navigation helpers.
 * 
 * Fixtures:
 * - `page` - Standard Playwright page with E2E styles (disabled animations, non-blocking toasts)
 * - `app` - PlaywrightFixture instance for SPA-friendly navigation
 * 
 * @example
 * ```ts
 * import { test, expect } from './extend'
 * 
 * test('my test', async ({ page, app }) => {
 *   await app.ensureRoute('/home/files')  // Auto goto() or navigateTo() as needed
 *   await app.clickLink('/home/apps')     // SPA navigation with network wait
 * })
 * ```
 * 
 * PlaywrightFixture methods (via `app`):
 * - `ensureRoute(path)` - Ensures page is at route (auto goto if not initialized, else SPA nav)
 * - `goto(path)` - Full page navigation (marks page as initialized)
 * - `navigateTo(path)` - SPA navigation via pushState (requires initialized page)
 * - `clickLink(href)` - Click a link for client-side navigation
 * - `clickElement(selector)` - Click any element with network wait
 * - `clickSubmitButton(action)` - Click submit button by formAction
 * - `waitForNetworkAfter(fn)` - Wrap any action with network idle wait
 * - `goBack()` / `goForward()` / `reload()` - Navigation with network wait
 * 
 * Based on React Router's PlaywrightFixture:
 * @see https://github.com/remix-run/react-router/blob/main/integration/helpers/playwright-fixture.ts
 */
export const test = base.extend<Fixtures>({
  page: async ({ page }, use) => {
    setupPageStyles(page)
    await use(page)
  },
  
  app: async ({ page }, use) => {
    const app = new PlaywrightFixture(page)
    await use(app)
  },
})

export { expect } from 'playwright/test'
