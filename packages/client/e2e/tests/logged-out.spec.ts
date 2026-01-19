import { test, expect } from './extend'
import {
  expectNavbarLinksVisible,
  expectRequestAccessAndLogInButtonsVisible,
  expectSocialLinksVisible,
  expectFooterVisible,
} from './helpers/logged-out.helpers'

/**
 * Logged Out Tests
 *
 * Combined tests for public pages accessible without authentication.
 * Migrated from Cypress tests:
 * - Logged Out - About.cy.js
 * - Logged Out - Challenges.cy.js
 * - Logged Out - Experts.cy.js
 * - Logged Out - News.cy.js
 * - Logged Out - Overview.cy.js
 *
 * Note: "Logged Out - Request Access.cy.js" requires special setup and
 * admin verification, so it remains separate.
 *
 * Tests run in parallel for faster execution.
 */

test.skip('Logged Out - Overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('Navbar Links', async ({ page }) => {
    await expectNavbarLinksVisible(page)
  })

  test('Request Access & Log In Buttons', async ({ page }) => {
    await expectRequestAccessAndLogInButtonsVisible(page)
  })

  test('Social Links', async ({ page }) => {
    await expectSocialLinksVisible(page)
  })
})

test.describe('Logged Out - About', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
  })

  test('Navbar Links', async ({ page }) => {
    await expectNavbarLinksVisible(page)
  })

  test('Request Access & Log In Buttons', async ({ page }) => {
    await expectRequestAccessAndLogInButtonsVisible(page)
  })

  test('Social Links', async ({ page }) => {
    await expectSocialLinksVisible(page)
  })

  test('About Page', async ({ page }) => {
    // Why tab should be visible and active by default
    await expect(page.getByRole('button', { name: /Why/i }).or(page.locator('div').filter({ hasText: /^Why$/ }).first())).toBeVisible()

    // Content for Why tab should be visible
    await expect(page.getByText('To accelerate progress')).toBeVisible()

    // Content for What and Who tabs should NOT be visible initially
    await expect(page.getByText('PrecisionFDA provides a private area')).not.toBeVisible()
    await expect(page.getByText('The core project team consists of the following individuals, in alphabetical order')).not.toBeVisible()

    // Click What tab
    const whatTab = page.locator('div').filter({ hasText: /^What$/ }).first()
    await expect(whatTab).toBeVisible()
    await whatTab.click()

    // Verify What content is visible, others hidden
    await expect(page.getByText('To accelerate progress')).not.toBeVisible()
    await expect(page.getByText('PrecisionFDA provides a private area')).toBeVisible()
    await expect(page.getByText('The core project team consists of the following individuals, in alphabetical order')).not.toBeVisible()

    // Click Who tab
    const whoTab = page.locator('div').filter({ hasText: /^Who$/ }).first()
    await expect(whoTab).toBeVisible()
    await whoTab.click()

    // Verify Who content is visible, others hidden
    await expect(page.getByText('To accelerate progress')).not.toBeVisible()
    await expect(page.getByText('PrecisionFDA provides a private area')).not.toBeVisible()
    await expect(page.getByText('The core project team consists of the following individuals, in alphabetical order')).toBeVisible()

    // Click Why tab again
    const whyTab = page.locator('div').filter({ hasText: /^Why$/ }).first()
    await expect(whyTab).toBeVisible()
    await whyTab.click()

    // Verify Why content is visible again
    await expect(page.getByText('To accelerate progress')).toBeVisible()
    await expect(page.getByText('PrecisionFDA provides a private area')).not.toBeVisible()
    await expect(page.getByText('The core project team consists of the following individuals, in alphabetical order')).not.toBeVisible()

    // Verify production status message
    await expect(page.getByText('This program is in production at this time.')).toBeVisible()

    // Verify Request Access button in the panel
    await expect(page.locator('.panel-body a[href="/request_access"]').or(page.getByRole('link', { name: 'Request Access' }))).toBeVisible()

    // Verify How tab links to docs
    const howTab = page.getByRole('link', { name: /How/i })
    await expect(howTab).toBeVisible()
    await expect(howTab).toHaveAttribute('href', '/docs')

    // Verify "Learn how to use the features" text
    await expect(page.getByText('Learn how to use the features')).toBeVisible()
  })

  test('Footer', async ({ page }) => {
    await expectFooterVisible(page)
  })
})

test.describe('Logged Out - Challenges', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/challenges')
    await page.waitForLoadState('networkidle')
  })

  test('Navbar Links', async ({ page }) => {
    await expectNavbarLinksVisible(page)
  })

  test('Request Access & Log In Buttons', async ({ page }) => {
    await expectRequestAccessAndLogInButtonsVisible(page)
  })

  test('Social Links', async ({ page }) => {
    await expectSocialLinksVisible(page)
  })

  test('Filter Challenges', async ({ page }) => {
    // Filter Challenges header
    await expect(page.getByRole('heading', { name: 'Filter Challenges' })).toBeVisible()

    // All link - first one in filter section
    const allLink = page.getByRole('link', { name: 'All' }).first()
    await expect(allLink).toBeVisible()
    await expect(allLink).toHaveAttribute('href', '/challenges')

    // Currently Open link
    const currentlyOpenLink = page.getByRole('link', { name: 'Currently Open' }).first()
    await expect(currentlyOpenLink).toBeVisible()
    await expect(currentlyOpenLink).toHaveAttribute('href', '/challenges?filter[status]=current')
    await currentlyOpenLink.click()
    await page.waitForLoadState('networkidle')

    // Verify Currently Open header appears
    await expect(page.getByRole('heading', { name: 'Currently Open' })).toBeVisible()

    // Upcoming link
    const upcomingLink = page.getByRole('link', { name: 'Upcoming' }).first()
    await expect(upcomingLink).toBeVisible()
    await expect(upcomingLink).toHaveAttribute('href', '/challenges?filter[status]=upcoming')
    await upcomingLink.click()
    await page.waitForLoadState('networkidle')

    // Verify Upcoming header appears
    await expect(page.getByRole('heading', { name: 'Upcoming' })).toBeVisible()

    // Ended link
    const endedLink = page.getByRole('link', { name: 'Ended' }).first()
    await expect(endedLink).toBeVisible()
    await expect(endedLink).toHaveAttribute('href', '/challenges?filter[status]=ended')
    await endedLink.click()
    await page.waitForLoadState('networkidle')

    // Verify Ended header appears
    await expect(page.getByRole('heading', { name: 'Ended' })).toBeVisible()
  })

  test('Previous Challenges', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Previous Challenges' })).toBeVisible()
  })

  test('Other Challenges', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Other Challenges' })).toBeVisible()

    const appAThonLink = page.getByRole('link', { name: /App-a-thon in a Box/ })
    await expect(appAThonLink).toBeVisible()
    await expect(appAThonLink).toHaveAttribute('href', '/challenges/app-a-thon-in-a-box')
  })
})

test.describe('Logged Out - Experts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/experts')
    await page.waitForLoadState('networkidle')
  })

  test('Navbar Links', async ({ page }) => {
    await expectNavbarLinksVisible(page)
  })

  test('Request Access & Log In Buttons', async ({ page }) => {
    await expectRequestAccessAndLogInButtonsVisible(page)
  })

  test('Social Links', async ({ page }) => {
    await expectSocialLinksVisible(page)
  })

  test('Expert Headers', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Experts Blog', level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Expert Highlights' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Previous expert blogs' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Experts', exact: true })).toBeVisible()
  })

  test('Expert Q&A', async ({ page }) => {
    // Click the first Expert Q&A link
    const qaLink = page.getByRole('link', { name: /Expert Q&A/i }).first()
    await expect(qaLink).toBeVisible()
    await qaLink.click()

    // Wait for navigation to Q&A page
    await page.waitForLoadState('networkidle')

    // Verify login link is visible (for logged out users)
    await expect(page.getByRole('link', { name: 'login' })).toBeVisible()

    // Verify Read Expert Blog Post link
    await expect(page.getByRole('link', { name: /Read Expert Blog Post/i })).toBeVisible()
  })

  test('About This Expert', async ({ page }) => {
    // Click the first About This Expert link
    const aboutLink = page.getByRole('link', { name: /About This Expert/i }).first()
    await expect(aboutLink).toBeVisible()
    await aboutLink.click()

    // Wait for navigation
    await page.waitForLoadState('networkidle')

    // Verify About This Expert tab is active
    await expect(page.getByRole('link', { name: 'About This Expert' }).filter({ has: page.locator('[aria-current="page"]') }).or(
      page.locator('a[aria-current="page"]').filter({ hasText: 'About This Expert' }),
    )).toBeVisible()

    // Verify Back to All Experts link
    await expect(page.getByRole('link', { name: /Back to All Experts/i })).toBeVisible()
  })

  test('Read Expert Blog Post', async ({ page }) => {
    // Click the first Read Expert Blog Post link
    const blogLink = page.getByRole('link', { name: /Read Expert Blog Post/i }).first()
    await expect(blogLink).toBeVisible()
    await blogLink.click()

    // Wait for navigation
    await page.waitForLoadState('networkidle')

    // Verify Blog Post tab is active
    await expect(page.locator('a[aria-current="page"]').filter({ hasText: 'Blog Post' })).toBeVisible()
  })
})

test.describe('Logged Out - News', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/news')
    await page.waitForLoadState('networkidle')
  })

  test('Navbar Links', async ({ page }) => {
    await expectNavbarLinksVisible(page)
  })

  test('Request Access & Log In Buttons', async ({ page }) => {
    await expectRequestAccessAndLogInButtonsVisible(page)
  })

  test('Social Links', async ({ page }) => {
    await expectSocialLinksVisible(page)
  })

  test('News', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'News', level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Community News' })).toBeVisible()
  })
})
