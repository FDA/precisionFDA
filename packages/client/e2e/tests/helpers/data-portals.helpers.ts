import { expect, Page } from 'playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ==================== Shared Constants ====================

/**
 * Timeouts for data portal operations
 */
export const TIMEOUTS = {
  pageLoad: 60000,
  toastMessage: 10000,
}

/**
 * Fixtures directory (contains test files like dataPortal.png)
 */
export const fixturesDir = path.join(__dirname, '../../fixtures')

// ==================== URL Helper ====================

export const UrlHelper = {
  getLastPathSegment(url: string): string {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const segments = pathname.split('/')
    return segments.pop() || ''
  },
}

// ==================== DataPortalsList Helper ====================

export const DataPortalsList = {
  /**
   * Navigate to data portals list page
   */
  async goToList(page: Page) {
    await page.goto('/data-portals')
    await page.waitForLoadState('networkidle')
  },

  /**
   * Validate the data portals list page is visible
   */
  async validateListPage(page: Page) {
    await expect(page.locator('h1').filter({ hasText: 'Data Portals' })).toBeVisible({
      timeout: TIMEOUTS.pageLoad,
    })
  },

  /**
   * Click "Create a Data Portal" button
   */
  async clickCreateButton(page: Page) {
    await page.getByRole('link', { name: 'Create a Data Portal' }).click()
    await page.waitForLoadState('networkidle')
  },

  /**
   * Click "Back to Data Portals" link
   */
  async clickBackToList(page: Page) {
    await page.getByRole('link', { name: 'Back to Data Portals' }).click()
    await page.waitForLoadState('networkidle')
  },

  /**
   * Click on a data portal by name
   */
  async clickDataPortal(page: Page, portalName: string) {
    await page.getByRole('link', { name: portalName }).click()
    await page.waitForLoadState('networkidle')
  },
}

// ==================== DataPortalForm Helper ====================

export const DataPortalForm = {
  /**
   * Validate the create form page is visible
   */
  async validateCreateFormPage(page: Page) {
    await expect(page.locator('h1').filter({ hasText: 'Create a Data Portal' })).toBeVisible()
  },

  /**
   * Fill in the data portal name
   */
  async fillName(page: Page, name: string) {
    await page.locator('input[name="name"]').fill(name)
  },

  /**
   * Fill in the data portal description
   */
  async fillDescription(page: Page, description: string) {
    await page.locator('input[name="description"]').fill(description)
  },

  /**
   * Clear and fill the data portal description
   */
  async clearAndFillDescription(page: Page, description: string) {
    await page.locator('input[name="description"]').clear()
    await page.locator('input[name="description"]').fill(description)
  },

  /**
   * Upload the portal image
   */
  async uploadImage(page: Page, imagePath: string) {
    await page.locator('input[type="file"]').setInputFiles(imagePath)
  },

  /**
   * Select host lead user
   */
  async selectHostLead(page: Page, username: string) {
    const input = page.locator('#data-portal_host-lead')
    await input.fill(username)
    await page.waitForTimeout(500)
    await page.keyboard.press('Enter')
  },

  /**
   * Select guest lead user
   */
  async selectGuestLead(page: Page, username: string) {
    const input = page.locator('#data-portal_guest-lead')
    await input.fill(username)
    await page.waitForTimeout(500)
    await page.keyboard.press('Enter')
  },

  /**
   * Fill in the sort order
   */
  async fillSortOrder(page: Page, sortOrder: string) {
    const input = page.locator('input[name="sort_order"]')
    await input.clear()
    await input.fill(sortOrder)
  },

  /**
   * Append text to name field
   */
  async appendToName(page: Page, text: string) {
    const input = page.locator('input[name="name"]')
    const currentValue = await input.inputValue()
    await input.fill(currentValue + text)
  },

  /**
   * Submit the form
   */
  async submit(page: Page) {
    await page.getByRole('button', { name: 'Submit' }).click()
  },

  /**
   * Validate submit button state
   */
  async validateSubmitButtonEnabled(page: Page) {
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled()
  },

  /**
   * Validate submit button is disabled
   */
  async validateSubmitButtonDisabled(page: Page) {
    await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled()
  },

  /**
   * Validate host lead input is disabled (in edit mode)
   * React-select renders a control with 'disabled' class when isDisabled=true
   */
  async validateHostLeadDisabled(page: Page) {
    await expect(page.locator('.pf-select-control.disabled').filter({ has: page.locator('#data-portal_host-lead') })).toBeVisible()
  },

  /**
   * Validate guest lead input is disabled (in edit mode)
   */
  async validateGuestLeadDisabled(page: Page) {
    await expect(page.locator('.pf-select-control.disabled').filter({ has: page.locator('#data-portal_guest-lead') })).toBeVisible()
  },
}

// ==================== DataPortalDetail Helper ====================

export const DataPortalDetail = {
  /**
   * Validate "no content" message is visible
   */
  async validateNoContent(page: Page) {
    await expect(page.getByText('This Data Portal has no content')).toBeVisible()
  },

  /**
   * Validate portal name is visible
   */
  async validateName(page: Page, portalName: string) {
    await expect(page.getByText(portalName)).toBeVisible()
  },

  /**
   * Validate portal description is visible
   */
  async validateDescription(page: Page, description: string) {
    await expect(page.getByText(description)).toBeVisible()
  },

  /**
   * Click Portal Settings link
   */
  async clickPortalSettings(page: Page) {
    await page.getByRole('link', { name: 'Portal Settings' }).click()
    await page.waitForLoadState('networkidle')
  },

  /**
   * Click Edit Content link
   */
  async clickEditContent(page: Page) {
    await page.getByRole('link', { name: 'Edit Content' }).click()
    await page.waitForLoadState('networkidle')
  },

  /**
   * Click Resources link (opens the resources modal)
   */
  async clickResources(page: Page) {
    // Resources is a ListItem with an onClick handler that opens a modal
    await page.locator('a', { hasText: 'Resources' }).click()
    await page.waitForLoadState('networkidle')
  },
}

// ==================== DataPortalResources Helper ====================

export const DataPortalResources = {
  /**
   * Click Upload Resources button
   */
  async clickUploadResources(page: Page) {
    await page.getByRole('button', { name: 'Upload Resources' }).click()
  },

  /**
   * Upload a resource file
   */
  async uploadFile(page: Page, filePath: string) {
    await page.locator('input[type="file"]').setInputFiles(filePath)
  },

  /**
   * Click Upload button to submit the file (inside the modal)
   */
  async submitUpload(page: Page) {
    await page.getByTestId('modal-add-resource').getByRole('button', { name: 'Upload' }).click()
  },

  /**
   * Search for a resource
   */
  async searchResource(page: Page, query: string) {
    await page.getByPlaceholder('Search resources...').fill(query)
  },

  /**
   * Click on a resource by name
   */
  async clickResource(page: Page, resourceName: string) {
    await page.getByText(resourceName, { exact: false }).click()
  },

  /**
   * Click Delete button for the selected resource
   */
  async clickDelete(page: Page) {
    await page.getByRole('button', { name: 'Delete' }).click()
  },

  /**
   * Validate no resources found message
   */
  async validateNoResourcesFound(page: Page) {
    await expect(page.getByText('No resources found')).toBeVisible({ timeout: TIMEOUTS.pageLoad })
  },
}

// ==================== DataPortalContent Helper ====================

export const DataPortalContent = {
  /**
   * Clear and type content in the editor
   */
  async setContent(page: Page, content: string) {
    const editor = page.locator('.ContentEditable__root')
    await editor.clear()
    await editor.pressSequentially(content)
  },

  /**
   * Click Insert dropdown button in the Lexical toolbar
   */
  async clickInsert(page: Page) {
    // The Insert button has buttonLabel="Insert" and buttonClassName contains "toolbar-item"
    await page.locator('button.toolbar-item', { hasText: 'Insert' }).click()
  },

  /**
   * Click Image option in Insert menu
   */
  async clickImageOption(page: Page) {
    // The Image menu item is inside the dropdown - use exact match to avoid "Full-Width Image"
    await page.getByRole('button', { name: 'Image', exact: true }).click()
  },

  /**
   * Select the first image resource
   */
  async selectFirstImage(page: Page) {
    await page.locator('img[alt="resource item"]').first().click()
  },

  /**
   * Click Insert Image button in the resource selection panel
   */
  async clickInsertImage(page: Page) {
    await page.getByRole('button', { name: 'Insert Image' }).click()
  },

  /**
   * Click Save button
   */
  async clickSave(page: Page) {
    await page.getByRole('button', { name: 'Save' }).click()
  },
}
