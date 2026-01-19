import { test as base, Page } from 'playwright/test'

// ==================== Types ====================

export type E2EStylesTestFixtures = {
  /** Page with E2E styles (disabled animations, non-blocking toasts) */
  page: Page
}

// ==================== CSS ====================

/**
 * CSS that disables all animations and transitions for snappy E2E tests.
 */
const DISABLE_ANIMATIONS_CSS = `
  *:not(.Toastify *):not(.Toastify),
  *:not(.Toastify *)::before,
  *:not(.Toastify *)::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
  }
`

/**
 * CSS that makes toast notifications non-blocking for E2E tests.
 */
const TOAST_NON_BLOCKING_CSS = `
  .Toastify,
  .Toastify__toast-container {
    pointer-events: none !important;
  }
  .Toastify__toast {
    pointer-events: auto !important;
  }
  .Toastify *,
  .Toastify *::before,
  .Toastify *::after {
    animation-delay: 0s !important;
    transition-duration: 50ms !important;
  }
`

// ==================== Helpers ====================

/**
 * Inject CSS into a page to disable animations and make toasts non-blocking
 */
async function injectE2EStyles(page: Page) {
  const alreadyInjected = await page.evaluate(() => {
    return document.querySelector('style[data-testid="e2e-styles"]') !== null
  }).catch(() => false)
  
  if (!alreadyInjected) {
    await page.addStyleTag({ 
      content: DISABLE_ANIMATIONS_CSS + TOAST_NON_BLOCKING_CSS,
    }).catch(() => {})
    await page.evaluate(() => {
      const style = document.querySelector('style:last-of-type')
      if (style) style.setAttribute('data-testid', 'e2e-styles')
    }).catch(() => {})
  }
}

/**
 * Set up a page with E2E styles injection on navigation
 */
export function setupPageStyles(page: Page) {
  page.on('domcontentloaded', () => injectE2EStyles(page))
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) injectE2EStyles(page)
  })
}

// ==================== Fixtures ====================

/**
 * E2E styles fixtures for Playwright tests.
 * Automatically injects CSS to disable animations and make toasts non-blocking.
 */
export const e2eStylesFixtures: Parameters<typeof base.extend<E2EStylesTestFixtures>>[0] = {
  page: async ({ page }, use) => {
    setupPageStyles(page)
    await use(page)
  },
}
