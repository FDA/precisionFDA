import { expect, Page } from 'playwright/test'

/**
 * Helper functions for logged-out page tests.
 * These verify common UI elements that appear across public pages.
 */

/**
 * Verify the public navbar links are visible and have correct hrefs.
 * Checks: Home, Challenges, News, Experts, UNII Search, GSRS links
 */
export async function expectNavbarLinksVisible(page: Page): Promise<void> {
  const navbar = page.getByTestId('public-navbar')
  await expect(navbar).toBeVisible()

  // Check navigation links
  await expect(navbar.getByRole('link', { name: 'Home' })).toBeVisible()
  await expect(navbar.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')

  await expect(navbar.getByRole('link', { name: 'Challenges' })).toBeVisible()
  await expect(navbar.getByRole('link', { name: 'Challenges' })).toHaveAttribute('href', '/challenges')

  await expect(navbar.getByRole('link', { name: 'News' })).toBeVisible()
  await expect(navbar.getByRole('link', { name: 'News' })).toHaveAttribute('href', '/news')

  await expect(navbar.getByRole('link', { name: 'Experts' })).toBeVisible()
  await expect(navbar.getByRole('link', { name: 'Experts' })).toHaveAttribute('href', '/experts')

  await expect(navbar.getByRole('link', { name: 'UNII Search' })).toBeVisible()
  await expect(navbar.getByRole('link', { name: 'UNII Search' })).toHaveAttribute('href', '/uniisearch')

  await expect(navbar.getByRole('link', { name: 'GSRS' })).toBeVisible()
  await expect(navbar.getByRole('link', { name: 'GSRS' })).toHaveAttribute('href', '/ginas/app/ui')
}

/**
 * Verify the Request Access and Log In buttons are visible.
 */
export async function expectRequestAccessAndLogInButtonsVisible(page: Page): Promise<void> {
  const navbarActions = page.getByTestId('public-navbar-actions')
  await expect(navbarActions).toBeVisible()

  await expect(navbarActions.getByRole('button', { name: 'Request Access' })).toBeVisible()
  await expect(navbarActions.getByRole('button', { name: 'Request Access' })).toBeEnabled()

  await expect(navbarActions.getByRole('button', { name: 'Log In', exact: true })).toBeVisible()
  await expect(navbarActions.getByRole('button', { name: 'Log In', exact: true })).toBeEnabled()
}

/**
 * Verify the social/contact links are visible in the footer.
 * Checks: Email link (mailto:precisionfda@fda.hhs.gov)
 */
export async function expectSocialLinksVisible(page: Page): Promise<void> {
  const emailLink = page.locator('a[href="mailto:precisionfda@fda.hhs.gov"]').first()
  await expect(emailLink).toBeVisible()
  await expect(emailLink).toHaveAttribute('href', 'mailto:precisionfda@fda.hhs.gov')
}

/**
 * Verify the footer section is visible.
 */
export async function expectFooterVisible(page: Page): Promise<void> {
  const footer = page.locator('footer[role="contentinfo"]')
  await expect(footer).toBeVisible()
}
