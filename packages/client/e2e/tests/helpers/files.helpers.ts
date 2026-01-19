import { expect, Page } from 'playwright/test'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ==================== Shared Constants ====================

/**
 * Timeouts matching Cypress config
 */
export const TIMEOUTS = {
  pageLoad: 60000,
  fileDownload: 240000,
  fileUploadComplete: 1200000, // 20 minutes - for files to show size in bytes
}

/**
 * Downloads directory for test runs
 */
export const downloadsDir = path.join(__dirname, '../../downloads')

/**
 * Fixtures directory (contains test files like "Lot of Files")
 */
export const fixturesDir = path.join(__dirname, '../../fixtures')

// Ensure downloads directory exists
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true })
}

/**
 * Generate unique test identifier (like Cypress testId)
 */
export function generateTestId(): string {
  const d = new Date()
  return (
    d.getFullYear().toString() +
    ('0' + (d.getMonth() + 1)).slice(-2) +
    ('0' + d.getDate()).slice(-2) +
    ('0' + d.getHours()).slice(-2) +
    ('0' + d.getMinutes()).slice(-2) +
    ('0' + d.getSeconds()).slice(-2)
  )
}

// ==================== URL Helper ====================

export const UrlHelper = {
  getLastPathSegment(url: string): string {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const segments = pathname.split('/')
    return segments.pop() || ''
  },

  escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  },
}

// ==================== FilesList Helper ====================

export const FilesList = {
  /**
   * Search for a file in the files list
   */
  async searchFile(page: Page, fileName: string) {
    // Find the Name column filter input
    const filterInput = page.getByTestId('table-filter-name').getByRole('textbox')
    await filterInput.clear()
    await filterInput.fill(fileName)

    // Wait for debounce (500ms) then network to settle
    await page.waitForTimeout(600)
    await page.waitForLoadState('networkidle')
  },

  /**
   * Open file detail page by clicking on the file name
   */
  async openDetail(page: Page, fileName: string) {
    // Target the Name column specifically to avoid matching Origin column
    const fileLink = page.getByTestId('table-col-name').getByText(fileName, { exact: true })
    await expect(fileLink).toBeVisible({ timeout: 15000 })
    await fileLink.click()
    // Wait for detail page to load by checking for a detail-specific element
    await expect(page.getByTestId('file-name')).toBeVisible({ timeout: 15000 })
  },

  /**
   * Search for a file and open its detail page
   */
  async searchFileAndOpenDetail(page: Page, fileName: string) {
    await FilesList.searchFile(page, fileName)
    await FilesList.openDetail(page, fileName)
  },

  /**
   * Search for a file, wait for it to be closed (show size in bytes), then open detail
   */
  async searchFileAndOpenDetailWhenClosed(page: Page, fileName: string) {
    await FilesList.searchFile(page, fileName)
    await FilesList.openDetail(page, fileName)
  },
}

// ==================== FileDetail Helper ====================

export const FileDetail = {
  /**
   * Validate an element is visible with exact text match
   */
  async validateElement(page: Page, testId: string, expectedValue: string | RegExp) {
    const regex =
      expectedValue instanceof RegExp ? expectedValue : new RegExp(`^${UrlHelper.escapeRegExp(expectedValue)}$`)
    await expect(page.getByTestId(testId).filter({ hasText: regex })).toBeVisible()
  },

  /**
   * Validate an element contains text (not exact match)
   */
  async validateElementContains(page: Page, testId: string, expectedValue: string | RegExp) {
    await expect(page.getByTestId(testId).filter({ hasText: expectedValue })).toBeVisible()
  },

  async validateBackToFilesLink(page: Page) {
    await expect(page.getByTestId('file-back-link').filter({ hasText: 'Back to Files' })).toBeVisible()
  },

  async validateName(page: Page, fileName: string) {
    await FileDetail.validateElement(page, 'file-name', fileName)
  },

  async validateDescription(page: Page, description: string) {
    await FileDetail.validateElement(page, 'file-description', description)
  },

  async validateIsLocked(page: Page) {
    await FileDetail.validateElement(page, 'file-locked', 'File is locked')
  },

  async validateIsNotLocked(page: Page) {
    await expect(page.getByTestId('file-locked')).not.toBeVisible()
  },

  async validateLocation(page: Page, location: string) {
    await FileDetail.validateElementContains(page, 'file-location', location)
  },

  async validateId(page: Page, fileId: string) {
    await FileDetail.validateElement(page, 'file-uid', fileId)
  },

  async validateAddedByUsername(page: Page, username: string) {
    await expect(page.getByTestId('file-added-by').locator(`a[href="/users/${username}"]`)).toBeVisible()
  },

  async validateOrigin(page: Page, origin: string) {
    await FileDetail.validateElementContains(page, 'file-origin', origin)
  },

  async validateSize(page: Page, size: string) {
    await FileDetail.validateElement(page, 'file-size', size)
  },

  async validateTag(page: Page, tagName: string) {
    await FileDetail.validateElement(page, 'file-tag-item', tagName)
  },

  async validateProperty(page: Page, key: string, value: string) {
    await FileDetail.validateElement(page, 'file-property-key', key)
    await FileDetail.validateElement(page, `file-property-value-${key}`, value)
  },

  async validateEmptyProperties(page: Page) {
    await expect(page.getByTestId('properties-container')).not.toBeVisible()
  },

  async validateEmptyTags(page: Page) {
    await expect(page.getByTestId('tags-container')).not.toBeVisible()
  },

  /**
   * Open the Actions dropdown menu
   */
  async openActionsMenu(page: Page) {
    const actionsButton = page.getByRole('button', { name: 'Actions' })
    await actionsButton.click()
    // Wait for the menu popup to be visible
    await expect(page.getByRole('menu', { name: 'Actions' })).toBeVisible({ timeout: 5000 })
  },

  /**
   * Click an item in the Actions dropdown menu
   */
  async clickActionsMenuItem(page: Page, menuItemText: string) {
    await FileDetail.openActionsMenu(page)
    const menuItem = page.getByRole('menuitem', { name: menuItemText })
    await expect(menuItem).toBeVisible({ timeout: 5000 })
    await menuItem.click()
  },

  /**
   * Add tags test - adds "Cypress Tag" and "Cypress Second Tag"
   */
  async addTagsTest(page: Page) {
    await FileDetail.clickActionsMenuItem(page, 'Edit tags')

    await page.locator('#edit-tag-form input[name="tags"]').clear()
    await page.locator('#edit-tag-form input[name="tags"]').fill('Cypress Tag, Cypress Second Tag')

    await page.getByRole('button', { name: 'Edit Tags' }).click()

    await expect(page.getByText(/^Successfully edited [a-zA-Z]+ tags/)).toBeVisible()

    await FileDetail.validateTag(page, 'Cypress Tag')
    await FileDetail.validateTag(page, 'Cypress Second Tag')
  },

  /**
   * Add properties test
   */
  async addPropertiesTest(page: Page) {
    await FileDetail.clickActionsMenuItem(page, 'Edit properties')

    await expect(page.getByText('No properties have been added')).toBeVisible()

    await page.getByRole('button', { name: 'Add a property' }).click()

    await page.locator('input[name="props.0.key"]').fill('Cypress Property Key')
    await page.locator('input[name="props.0.value"]').fill('Cypress Property Value')

    await page.getByRole('button', { name: 'Edit Properties' }).click()

    await expect(page.getByText('Properties updated')).toBeVisible({ timeout: TIMEOUTS.pageLoad })

    await FileDetail.validateProperty(page, 'Cypress Property Key', 'Cypress Property Value')

    await FileDetail.clickActionsMenuItem(page, 'Edit properties')

    await page.getByRole('button', { name: 'Add another property' }).click()

    await page.locator('input[name="props.1.key"]').fill('Cypress Second Property Key')
    await page.locator('input[name="props.1.value"]').fill('Cypress Second Property Value')

    await page.getByRole('button', { name: 'Edit Properties' }).click()

    await expect(page.getByText('Properties updated')).toBeVisible({ timeout: TIMEOUTS.pageLoad })

    await FileDetail.validateProperty(page, 'Cypress Property Key', 'Cypress Property Value')
    await FileDetail.validateProperty(page, 'Cypress Second Property Key', 'Cypress Second Property Value')
  },

  /**
   * Edit properties test
   */
  async editPropertiesTest(page: Page) {
    await FileDetail.clickActionsMenuItem(page, 'Edit properties')

    await page.locator('input[name="props.0.key"]').clear()
    await page.locator('input[name="props.0.key"]').fill('Cypress Property Key - Edited')

    await page.locator('input[name="props.0.value"]').clear()
    await page.locator('input[name="props.0.value"]').fill('Cypress Property Value - Edited')

    await page.locator('input[name="props.1.key"]').clear()
    await page.locator('input[name="props.1.key"]').fill('Cypress Second Property Key - Edited')

    await page.locator('input[name="props.1.value"]').clear()
    await page.locator('input[name="props.1.value"]').fill('Cypress Second Property Value - Edited')

    await page.getByRole('button', { name: 'Edit Properties' }).click()

    await expect(page.getByText('Properties updated')).toBeVisible({ timeout: TIMEOUTS.pageLoad })

    await FileDetail.validateProperty(page, 'Cypress Property Key - Edited', 'Cypress Property Value - Edited')
    await FileDetail.validateProperty(
      page,
      'Cypress Second Property Key - Edited',
      'Cypress Second Property Value - Edited'
    )
  },

  /**
   * Delete properties test
   */
  async deletePropertiesTest(page: Page) {
    await expect(page.getByTestId('properties-container')).toBeVisible()

    await FileDetail.validateProperty(page, 'Cypress Property Key - Edited', 'Cypress Property Value - Edited')
    await FileDetail.validateProperty(
      page,
      'Cypress Second Property Key - Edited',
      'Cypress Second Property Value - Edited'
    )

    await FileDetail.clickActionsMenuItem(page, 'Edit properties')

    await page.getByTestId('property-remove').first().click()
    await page.getByTestId('property-remove').click()

    await page.getByRole('button', { name: 'Edit Properties' }).click()

    await expect(page.getByText('Properties updated')).toBeVisible({ timeout: TIMEOUTS.pageLoad })

    await expect(page.getByTestId('properties-container')).not.toBeVisible()
    await FileDetail.validateEmptyProperties(page)
  },
}

// ==================== SpacesList Helper ====================

export const SpacesList = {
  /**
   * Search for a space by name
   */
  async searchSpace(page: Page, spaceName: string, spaceState?: string) {
    await expect(page.locator('h1').filter({ hasText: 'Spaces' })).toBeVisible({ timeout: TIMEOUTS.pageLoad })

    // Find the Name column filter input
    const filterInput = page.getByTestId('table-filter-name').getByRole('textbox')

    // Clear the filter first to ensure a fresh search
    await filterInput.clear()
    // Wait for any pending requests from clearing to complete
    await page.waitForLoadState('networkidle')

    // Fill the filter
    await filterInput.fill(spaceName)

    // Wait for debounce (500ms) to trigger the API call, then wait for network to settle
    await page.waitForTimeout(600)
    await page.waitForLoadState('networkidle')
  },

  /**
   * Create a private space if it doesn't exist
   */
  async createPrivateSpaceIfNotExists(page: Page, spaceName: string, spaceDescription: string) {
    // Search without state filter to avoid issues if the filter doesn't exist
    await SpacesList.searchSpace(page, spaceName)

    await page.waitForTimeout(2000)

    const spaceExists = await page.getByTestId('table-col-name').first().isVisible().catch(() => false)

    if (!spaceExists) {
      await expect(page.getByText('No spaces available.')).toBeVisible()
      await SpacesList.createPrivateSpace(page, spaceName, spaceDescription)
    }
  },

  /**
   * Create a new private space
   */
  async createPrivateSpace(page: Page, spaceName: string, spaceDescription: string) {
    await page.getByText(/^[ ]*Create Space$/).click()

    // Wait for the create space form to load
    await expect(page.getByRole('heading', { name: 'Create a new Space' })).toBeVisible()

    // Private is selected by default, but click the label if needed
    const privateRadio = page.getByRole('radio', { name: 'Private' })
    if (!(await privateRadio.isChecked())) {
      await page.getByRole('radiogroup', { name: 'Spaces option select' }).getByText('Private').click()
    }

    await page.locator('input[name="name"]').clear()
    await page.locator('input[name="name"]').fill(spaceName)

    await page.locator('input[name="description"]').clear()
    await page.locator('input[name="description"]').fill(spaceDescription)

    await page.getByRole('button', { name: 'Create Space' }).click()

    await expect(page.getByText('Space successfully created')).toBeVisible()
  },

  /**
   * Search for a space and open its detail page
   */
  async searchSpaceOpenDetail(page: Page, spaceName: string) {
    await SpacesList.searchSpace(page, spaceName)

    // Verify space is in the list - the space name is a link inside the cell
    const spaceLink = page.getByTestId('table-col-name').getByRole('link', { name: spaceName })
    await expect(spaceLink).toBeVisible({ timeout: 15000 })

    // Click the space link to open detail
    await spaceLink.click()

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle')

    // Verify we're on the space detail page by checking the URL contains /spaces/
    await expect(page).toHaveURL(/\/spaces\/\d+/)
  },
}

// ==================== Utility Functions ====================

/**
 * Delete file and wait for success
 */
export async function clickFileDeleteButtonAndAwaitSuccess(page: Page) {
  const deleteButton = page.getByRole('button', { name: 'Delete' })
  await deleteButton.waitFor({ state: 'visible', timeout: 5000 })
  await deleteButton.click()

  // Wait for the delete operation to complete
  await page.waitForLoadState('networkidle')

  await expect(page.getByText('Successfully deleted')).toBeVisible({ timeout: 90000 })
}

/**
 * Delete a file from My Home
 */
export async function deleteFileFromMyHome(page: Page, fileName: string, scope?: string) {
  if (scope) {
    await page.goto(`/home/files?scope=${scope}`)
  } else {
    await page.goto('/home/files')
  }

  await FilesList.searchFileAndOpenDetailWhenClosed(page, fileName)

  await FileDetail.clickActionsMenuItem(page, 'Delete')

  await clickFileDeleteButtonAndAwaitSuccess(page)
}

/**
 * Create a test file with content in the downloads directory
 */
export async function createTestFile(fileName: string, content: string = 'Hello World'): Promise<string> {
  const filePath = path.join(downloadsDir, fileName)
  fs.writeFileSync(filePath, content)
  return filePath
}

/**
 * Find a downloaded file by prefix and extension
 */
export function findDownloadedFile(prefix: string, extension: string): string | null {
  const files = fs.readdirSync(downloadsDir)
  const matchingFile = files.find((file) => file.startsWith(prefix) && file.endsWith(extension))
  return matchingFile || null
}
