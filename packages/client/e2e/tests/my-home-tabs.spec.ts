import { test, expect } from './fixtures/shared-page'
import { Page } from 'playwright/test'

/**
 * My Home - Tabs Tests
 * 
 * Tests navigation and basic functionality of all tabs in the My Home section
 * across different scopes: Me, Featured, Everyone, and Spaces.
 * 
 * Uses shared-page fixtures for faster serial test execution with SPA navigation.
 */

// Helper function to search in the name filter input
async function searchInNameFilter(page: Page, searchText: string) {
  // The filter input is in the table header row, using the class .filter-input
  // We target the first one which is the Name column filter
  const filterInput = page.locator('input.filter-input').first()
  await filterInput.clear()
  await filterInput.fill(searchText)
  // Wait for network idle instead of fixed timeout
  await page.waitForLoadState('networkidle')
}

// Tests must run in serial order to benefit from shared page SPA navigation
test.describe.configure({ mode: 'serial' })

test.describe('My Home - Tabs', () => {

  // ==================== Me Section ====================
  test.describe('Me Section', () => {
    test('Me - Files', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('home-files-link').click()


      await searchInNameFilter(page, 'non-existing-file')

      await expect(page.getByText("You don't have any files yet.")).toBeVisible()
    })

    test('Me - Apps', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('home-apps-link').click()

      await searchInNameFilter(page, 'non-existing-app')

      await expect(page.getByText("You don't have any apps yet.")).toBeVisible()
    })

    test('Me - Databases', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('home-databases-link').click()

      await searchInNameFilter(page, 'non-existing-db')

      await expect(page.getByText("You don't have any databases yet.")).toBeVisible()
    })

    test('Me - Assets', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('home-assets-link').click()

      await searchInNameFilter(page, 'non-existing-asset')

      await expect(page.getByText('There are no items here.')).toBeVisible()
    })

    test('Me - Workflows', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('home-workflows-link').click()

      await searchInNameFilter(page, 'non-existing-workflow')

      await expect(page.getByText("You don't have any workflows yet.")).toBeVisible()
    })

    test('Me - Executions', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('home-executions-link').click()

      await searchInNameFilter(page, 'non-existing-execution')

      await expect(page.getByText("You don't have any app executions yet.")).toBeVisible()
    })

    test('Me - Reports', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('home-reports-link').click()

      await expect(page.getByRole('button', { name: 'Generate report' })).toBeVisible()
    })
  })

  // ==================== Featured Section ====================
  test.describe('Featured Section', () => {
    test('Featured - Files', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('featured-button').click()
      await page.getByTestId('home-files-link').click()

      await searchInNameFilter(page, 'non-existing-file')

      await expect(page.getByText("You don't have any files yet.")).toBeVisible()
    })

    test('Featured - Apps', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('featured-button').click()
      await page.getByTestId('home-apps-link').click()

      await searchInNameFilter(page, 'non-existing-app')

      await expect(page.getByText("You don't have any apps yet.")).toBeVisible()
    })

    test('Featured - Assets', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('featured-button').click()
      await page.getByTestId('home-assets-link').click()

      await searchInNameFilter(page, 'non-existing-asset')

      await expect(page.getByText('There are no items here.')).toBeVisible()
    })

    test('Featured - Workflows', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('featured-button').click()
      await page.getByTestId('home-workflows-link').click()

      await searchInNameFilter(page, 'non-existing-workflow')

      await expect(page.getByText("You don't have any workflows yet.")).toBeVisible()
    })

    test('Featured - Executions', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('featured-button').click()
      await page.getByTestId('home-executions-link').click()

      await searchInNameFilter(page, 'non-existing-execution')

      await expect(page.getByText("You don't have any app executions yet.")).toBeVisible()
    })
  })

  // ==================== Everyone Section ====================
  test.describe('Everyone Section', () => {
    test('Everyone - Files', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('everyone-button').click()
      await page.getByTestId('home-files-link').click()

      await searchInNameFilter(page, 'non-existing-file')

      await expect(page.getByText("You don't have any files yet.")).toBeVisible()
    })

    test('Everyone - Apps', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('everyone-button').click()
      await page.getByTestId('home-apps-link').click()

      await searchInNameFilter(page, 'non-existing-app')

      await expect(page.getByText("You don't have any apps yet.")).toBeVisible()
    })

    test('Everyone - Assets', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('everyone-button').click()
      await page.getByTestId('home-assets-link').click()

      await searchInNameFilter(page, 'non-existing-asset')

      await expect(page.getByText('There are no items here.')).toBeVisible()
    })

    test('Everyone - Discussions', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('everyone-button').click()
      await page.getByTestId('home-discussions-link').click()

      const table = page.getByTestId('pfda-table')
      await expect(table.getByRole('button', { name: 'Title' })).toBeVisible()
      await expect(table.getByRole('button', { name: 'Created' })).toBeVisible()
      await expect(table.getByRole('button', { name: 'Added by' })).toBeVisible()
      await table.getByRole('button', { name: 'Answers' }).scrollIntoViewIfNeeded()
      await expect(table.getByRole('button', { name: 'Answers' })).toBeVisible()
      await table.getByRole('button', { name: 'Comments' }).scrollIntoViewIfNeeded()
      await expect(table.getByRole('button', { name: 'Comments' })).toBeVisible()
    })

    test('Everyone - Workflows', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('everyone-button').click()
      await page.getByTestId('home-workflows-link').click()

      await searchInNameFilter(page, 'non-existing-workflow')

      await expect(page.getByText("You don't have any workflows yet.")).toBeVisible()
    })

    test('Everyone - Executions', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('everyone-button').click()
      await page.getByTestId('home-executions-link').click()

      await searchInNameFilter(page, 'non-existing-execution')

      await expect(page.getByText("You don't have any app executions yet.")).toBeVisible()
    })
  })

  // ==================== Spaces Section ====================
  test.describe('Spaces Section', () => {
    test('Spaces - Files', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('spaces-button').click()
      await page.getByTestId('home-files-link').click()

      await searchInNameFilter(page, 'non-existing-file')

      await expect(page.getByText("You don't have any files yet.")).toBeVisible()
    })

    test('Spaces - Apps', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('spaces-button').click()
      await page.getByTestId('home-apps-link').click()

      await searchInNameFilter(page, 'non-existing-app')

      await expect(page.getByText("You don't have any apps yet.")).toBeVisible()
    })

    test('Spaces - Assets', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('spaces-button').click()
      await page.getByTestId('home-assets-link').click()

      await searchInNameFilter(page, 'non-existing-asset')

      await expect(page.getByText('There are no items here.')).toBeVisible()
    })

    test('Spaces - Discussions', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('spaces-button').click()
      await page.getByTestId('home-discussions-link').click()

      await expect(page.getByText('Title')).toBeVisible()
      await expect(page.getByText('Created')).toBeVisible()
      await expect(page.getByText('Added by')).toBeVisible()
      await page.getByText('Answers').scrollIntoViewIfNeeded()
      await expect(page.getByText('Answers')).toBeVisible()
      await page.getByText('Comments').scrollIntoViewIfNeeded()
      await expect(page.getByText('Comments')).toBeVisible()
    })

    test('Spaces - Workflows', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('spaces-button').click()
      await page.getByTestId('home-workflows-link').click()

      await searchInNameFilter(page, 'non-existing-workflow')

      await expect(page.getByText("You don't have any workflows yet.")).toBeVisible()
    })

    test('Spaces - Executions', async ({ page, app }) => {
      await app.ensureRoute('/home/')
      await page.getByTestId('spaces-button').click()
      await page.getByTestId('home-executions-link').click()

      await searchInNameFilter(page, 'non-existing-execution')

      await expect(page.getByText("You don't have any app executions yet.")).toBeVisible()
    })
  })
})
