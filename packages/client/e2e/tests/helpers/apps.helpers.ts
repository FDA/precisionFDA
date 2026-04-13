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
  userComputeResources: 60000,
  appSave: 60000,
  appRun: 120000,
  jobStatusChange: 1200000,
  fileDownload: 240000,
  pageLoad: 60000,
}

/**
 * Downloads directory for test runs
 */
export const downloadsDir = path.join(__dirname, '../../downloads')

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

// ==================== Page Object Helpers ====================

/**
 * CreateAppForm - Helper functions for creating apps
 */
export const CreateAppForm = {
  async submit(page: Page, appName: string, appTitle: string) {
    await CreateAppForm.setAppName(page, appName)
    await CreateAppForm.setAppTitle(page, appTitle)
    await CreateAppForm.setInstanceType(page, 'baseline 2')
    await CreateAppForm.setUbuntuRelease(page, '24.04')
    await CreateAppForm.send(page)
  },

  async setAppName(page: Page, appName: string) {
    await page.locator('input[name="name"]').fill(appName)
  },

  async setAppTitle(page: Page, appTitle: string) {
    await page.locator('input[name="title"]').fill(appTitle)
  },

  async setInstanceType(page: Page, instanceType: string) {
    // Click VM ENVIRONMENT tab
    await page.getByText('Configure your resources').click()

    // Select instance type
    await page.getByLabel('Instance Type').click()
    await page.keyboard.type(instanceType)
    await page.keyboard.press('Enter')
  },

  async setUbuntuRelease(page: Page, ubuntuRelease: string) {
    await page.getByLabel('Ubuntu Release').click()
    await page.keyboard.type(ubuntuRelease)
    await page.keyboard.press('Enter')
  },

  async addInput(page: Page, index: number, type: string, inputName: string, isOptional: boolean) {
    // Click I/O tab
    await page.getByText('Configure Input & Output Fields').click()

    // Wait for the I/O tab content to be visible
    const addInputButton = page.getByTestId('add-input-button')
    await expect(addInputButton).toBeVisible({ timeout: 10000 })

    // Add Input button (dropdown trigger)
    await addInputButton.click()

    // Select type from dropdown
    await page.getByTestId('io-items').getByText(type).click()

    // Set input name
    await page.locator(`input[name="input_spec.${index}.name"]`).fill(inputName)

    // Handle optional checkbox
    if (isOptional) {
      await page.locator(`label#input_spec\\.${index}\\.optional input[type="checkbox"]`).check({ force: true })
    }
  },

  async addOutput(
    page: Page,
    index: number,
    type: string,
    outputName: string,
    outputLabel: string,
    outputHelp: string,
    isOptional: boolean,
    isArray: boolean
  ) {
    // Click I/O tab
    await page.getByText('Configure Input & Output Fields').click()

    // Wait for the I/O tab content to be visible
    const addOutputButton = page.getByTestId('add-output-button')
    await expect(addOutputButton).toBeVisible({ timeout: 10000 })

    // Add Output button (dropdown trigger)
    await addOutputButton.click()

    // Select type from dropdown
    await page.getByTestId('io-items').getByText(type).click()

    // Set output name
    await page.locator(`input[name="output_spec.${index}.name"]`).fill(outputName)

    // Set optional fields
    if (outputLabel) {
      await page.locator(`input[name="output_spec.${index}.label"]`).fill(outputLabel)
    }

    if (outputHelp) {
      await page.locator(`input[name="output_spec.${index}.help"]`).fill(outputHelp)
    }

    if (isOptional) {
      await page.locator(`label#output_spec\\.${index}\\.optional input[type="checkbox"]`).check({ force: true })
    }

    if (isArray) {
      await page.locator(`label#output_spec\\.${index}\\.isArray input[type="checkbox"]`).check({ force: true })
    }
  },

  async setScript(page: Page, text: string) {
    // Click Script tab
    await page.getByText('Write your shell script').click()

    // Wait for Monaco editor to load - it can take a while
    const editor = page.getByTestId('script-editor').locator('.monaco-editor')
    await expect(editor).toBeVisible({ timeout: 90000 })
    await page.waitForTimeout(500)

    // Click into the editor and type the script
    await editor.click()

    // Monaco editor - use keyboard to type
    await page.keyboard.type(text, { delay: 0 })
  },

  async send(page: Page) {
    // Set Ubuntu release first
    await CreateAppForm.setUbuntuRelease(page, '24.04')

    // Click Create button
    await page.getByRole('button', { name: 'Create App' }).click({ force: true })

    // Wait for the create app API call to complete
    await page.waitForLoadState('networkidle')

    // Wait for success toast
    await expect(page.getByText('Your app was created successfully')).toBeVisible()

    await AppDetail.validateBackToAppsLink(page)
  },
}

/**
 * AppDetail - Helper functions for app detail page
 */
export const AppDetail = {
  async validateElement(page: Page, testId: string, expectedValue: string | RegExp) {
    const regex =
      expectedValue instanceof RegExp ? expectedValue : new RegExp(`^${UrlHelper.escapeRegExp(expectedValue)}$`)
    await expect(page.getByTestId(testId).filter({ hasText: regex })).toBeVisible()
  },

  async validateElementContains(page: Page, testId: string, expectedValue: string | RegExp) {
    await expect(page.getByTestId(testId).filter({ hasText: expectedValue })).toBeVisible()
  },

  async validateBackToAppsLink(page: Page) {
    await expect(page.getByTestId('app-back-link').filter({ hasText: 'Back to Apps' })).toBeVisible()
  },

  async validateName(page: Page, appName: string) {
    await AppDetail.validateElement(page, 'app-name', appName)
  },

  async validateTitle(page: Page, appTitle: string) {
    await AppDetail.validateElement(page, 'app-title', appTitle)
  },

  async validateLocation(page: Page, appLocation: string) {
    await AppDetail.validateElementContains(page, 'app-location', appLocation)
  },

  async validateId(page: Page, appId: string) {
    await AppDetail.validateElement(page, 'app-uid', appId)
  },

  async validateDefaultInstanceType(page: Page, instanceType: string) {
    await AppDetail.validateElement(page, 'app-default-instance-type', instanceType)
  },

  async validateHasInternetAccess(page: Page, hasAccess: string) {
    await AppDetail.validateElement(page, 'app-has-internet-access', hasAccess)
  },

  async validateUbuntuRelease(page: Page, release: string) {
    await AppDetail.validateElement(page, 'app-ubuntu-release', release)
  },

  async validateEmptyTags(page: Page) {
    const tagsContainer = page.getByTestId('tags-container')
    await expect(tagsContainer).not.toBeVisible()
  },

  async validateEmptyProperties(page: Page) {
    const propsContainer = page.getByTestId('properties-container')
    await expect(propsContainer).not.toBeVisible()
  },

  async validateTag(page: Page, tagName: string) {
    await AppDetail.validateElement(page, 'app-tag-item', tagName)
  },

  async validateForkedFrom(page: Page, originalAppId: string) {
    await AppDetail.validateElementContains(page, 'app-forked-from', originalAppId)
  },

  async validateProperty(page: Page, key: string, value: string) {
    await AppDetail.validateElement(page, 'app-property-key', key)
    await AppDetail.validateElement(page, `app-property-value-${key}`, value)
  },

  async openActionsMenu(page: Page) {
    const actionsButton = page.getByRole('button', { name: 'Actions' })
    await actionsButton.click()
    // Wait for the menu popup to be visible
    await expect(page.getByRole('menu', { name: 'Actions' })).toBeVisible({ timeout: 5000 })
  },

  async clickActionsMenuItem(page: Page, menuItemText: string) {
    await AppDetail.openActionsMenu(page)
    // Use exact matching to avoid matching "Edit" with "Edit tags" or "Edit properties"
    const menuItem = page.getByRole('menuitem', { name: menuItemText, exact: true })
    await expect(menuItem).toBeVisible({ timeout: 5000 })
    await menuItem.click()
  },

  async chooseRevision(page: Page, revision: number) {
    await page.getByRole('button', { name: /Revision:/ }).click()

    await page.getByTestId('dropdown-revisions').locator('..').locator('a').filter({ hasText: String(revision) }).click()

    // Wait for the revision to load
    await page.waitForLoadState('networkidle')
  },

  async chooseLatestRevision(page: Page) {
    await page.getByRole('button', { name: /Revision:/ }).click()

    await page.getByTestId('dropdown-revisions').locator('..').locator('a').filter({ hasText: 'Latest' }).click()

    // Wait for the latest revision to load
    await page.waitForLoadState('networkidle')
  },

  async addTagsTest(page: Page) {
    await AppDetail.clickActionsMenuItem(page, 'Edit tags')

    await page.locator('#edit-tag-form input[name="tags"]').clear()
    await page.locator('#edit-tag-form input[name="tags"]').fill('Cypress Tag, Cypress Second Tag')

    await page.getByRole('button', { name: 'Edit Tags' }).click()

    await expect(page.getByText(/^Successfully edited [a-zA-Z]+ tags/)).toBeVisible()

    await AppDetail.validateTag(page, 'Cypress Tag')
    await AppDetail.validateTag(page, 'Cypress Second Tag')
  },

  async addPropertiesTest(page: Page) {
    await AppDetail.clickActionsMenuItem(page, 'Edit properties')

    await expect(page.getByText('No properties have been added')).toBeVisible()

    await page.getByRole('button', { name: 'Add a property' }).click()

    await page.locator('input[name="props.0.key"]').fill('Cypress Property Key')
    await page.locator('input[name="props.0.value"]').fill('Cypress Property Value')

    await page.getByRole('button', { name: 'Edit Properties' }).click()

    await expect(page.getByText('Properties updated')).toBeVisible({ timeout: TIMEOUTS.pageLoad })

    await AppDetail.validateProperty(page, 'Cypress Property Key', 'Cypress Property Value')

    await AppDetail.clickActionsMenuItem(page, 'Edit properties')

    await page.getByRole('button', { name: 'Add another property' }).click()

    await page.locator('input[name="props.1.key"]').fill('Cypress Second Property Key')
    await page.locator('input[name="props.1.value"]').fill('Cypress Second Property Value')

    await page.getByRole('button', { name: 'Edit Properties' }).click()

    await expect(page.getByText('Properties updated')).toBeVisible({ timeout: TIMEOUTS.pageLoad })

    await AppDetail.validateProperty(page, 'Cypress Property Key', 'Cypress Property Value')
    await AppDetail.validateProperty(page, 'Cypress Second Property Key', 'Cypress Second Property Value')
  },

  async editPropertiesTest(page: Page) {
    await AppDetail.clickActionsMenuItem(page, 'Edit properties')

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

    await AppDetail.validateProperty(page, 'Cypress Property Key - Edited', 'Cypress Property Value - Edited')
    await AppDetail.validateProperty(page, 'Cypress Second Property Key - Edited', 'Cypress Second Property Value - Edited')
  },

  async deletePropertiesTest(page: Page) {
    const propsContainer = page.getByTestId('properties-container')
    await expect(propsContainer).toBeVisible()

    await AppDetail.validateProperty(page, 'Cypress Property Key - Edited', 'Cypress Property Value - Edited')
    await AppDetail.validateProperty(page, 'Cypress Second Property Key - Edited', 'Cypress Second Property Value - Edited')

    await AppDetail.clickActionsMenuItem(page, 'Edit properties')

    await page.getByTestId('property-remove').first().click()
    await page.getByTestId('property-remove').click()

    await page.getByRole('button', { name: 'Edit Properties' }).click()

    await expect(page.getByText('Properties updated')).toBeVisible({ timeout: TIMEOUTS.pageLoad })

    await expect(propsContainer).not.toBeVisible()
    await AppDetail.validateEmptyProperties(page)
  },
}

/**
 * AppExecution - Helper functions for app execution page
 */
export const AppExecution = {
  async validateElementContains(page: Page, testId: string, expectedValue: string | RegExp) {
    await expect(page.getByTestId(testId).filter({ hasText: expectedValue })).toBeVisible()
  },

  async validateBackToExecutionsLink(page: Page) {
    await expect(page.getByTestId('execution-back-link').filter({ hasText: 'Back to Executions' })).toBeVisible()
  },

  async validateAppTitle(page: Page, appTitle: string) {
    await AppExecution.validateElementContains(page, 'execution-app-title', appTitle)
  },

  async validateInstanceType(page: Page, instanceType: string) {
    await expect(page.getByTestId('execution-instance-type').filter({ hasText: instanceType })).toBeVisible()
  },

  async validateLocation(page: Page, location: string) {
    await AppExecution.validateElementContains(page, 'execution-location', location)
  },

  async validateStatus(page: Page, status: string | RegExp) {
    await AppExecution.validateElementContains(page, 'execution-status', status)
  },

  async validateOutput(page: Page, outputString: string | RegExp) {
    await AppExecution.validateElementContains(page, 'execution-outputs', outputString)
  },
}

/**
 * RunAppForm - Helper functions for running apps
 */
export const RunAppForm = {
  async prepare(page: Page) {
    // Check if we're on the run form (CONFIGURE text visible) or already on execution page
    const configureVisible = await page.getByTestId('run-app-configure-section').isVisible().catch(() => false)
    if (!configureVisible) {
      return // Already on execution page or form not shown
    }

    await RunAppForm.setInstanceType(page, 'baseline 2')
    await RunAppForm.setJobLimit(page, '0.1')
  },

  async setInstanceType(page: Page, instanceType: string) {
    const select = page.locator('#select_instance_type')
    // Check if the select is visible (we might already be on execution page)
    const isVisible = await select.isVisible().catch(() => false)
    if (!isVisible) {
      return // Instance type already set or form not shown
    }
    await select.click()
    await page.keyboard.type(instanceType)
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
  },

  async setJobName(page: Page, jobName: string) {
    const input = page.getByTestId('run-app-job-name')
    const isVisible = await input.isVisible().catch(() => false)
    if (!isVisible) return
    await input.clear()
    await input.fill(jobName)
  },

  async setJobLimit(page: Page, jobLimit: string) {
    const input = page.getByTestId('run-app-job-limit')
    const isVisible = await input.isVisible().catch(() => false)
    if (!isVisible) return
    await input.clear()
    await input.fill(jobLimit)
  },

  async setOutputFolder(page: Page, outputFolder: string) {
    const input = page.getByTestId('output_folder')
    await input.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null)
    const isVisible = await input.isVisible().catch(() => false)
    if (!isVisible) return
    await input.fill(outputFolder)
    await expect(input).toHaveValue(outputFolder)
    await input.press('Tab').catch(() => null)
  },

  async submit(page: Page) {
    await RunAppForm.prepare(page)
    await RunAppForm.send(page)
  },

  async send(page: Page) {
    // Check if "Run App" button is visible (might already be on execution page)
    const runAppButton = page.getByTestId('run-app-submit-button')
    const isVisible = await runAppButton.isVisible().catch(() => false)
    
    if (isVisible) {
      await expect(runAppButton).toBeEnabled({ timeout: 10000 })
      await runAppButton.scrollIntoViewIfNeeded()
      await runAppButton.click()
    }

    await expect(page.getByTestId('execution-back-link')).toBeVisible({ timeout: TIMEOUTS.appRun })
  },
}

/**
 * AppsList - Helper functions for apps list page
 */
export const AppsList = {
  async searchApp(page: Page, appName: string) {
    await expect(page.locator('a.active').filter({ hasText: 'Apps' })).toBeVisible()

    // Find the Name column filter input
    const filterInput = page.getByTestId('table-filter-name').getByRole('textbox')
    await filterInput.clear()

    // Fill the search input
    await filterInput.fill(appName)

    // Wait for debounce (500ms) to trigger the API call, then wait for network to settle
    await page.waitForTimeout(600)
    await page.waitForLoadState('networkidle')
  },

  async openDetail(page: Page, appName: string, appTitle: string) {
    // Verify app is in the list (with longer timeout for table to update)
    // await expect(page.getByTestId('table-col-name').filter({ hasText: appName })).toBeVisible()
    // await expect(page.getByTestId('table-col-title').filter({ hasText: appTitle })).toBeVisible()

    // Click the app link and wait for navigation
    await page.getByTestId('table-col-name').filter({ hasText: appName }).getByRole('link').click()

    // Wait for app detail page to load
    await page.waitForLoadState('networkidle')
  },

  async searchAppAndOpenDetail(page: Page, appName: string, appTitle: string) {
    await AppsList.searchApp(page, appName)
    await AppsList.openDetail(page, appName, appTitle)
  },
}

/**
 * FilesList - Helper functions for files list page
 */
export const FilesList = {
  async searchFile(page: Page, fileName: string) {
    // Find the Name column filter input
    const filterInput = page.getByTestId('table-filter-name').getByRole('textbox')
    await filterInput.clear()

    // Fill the search input
    await filterInput.fill(fileName)

    // Wait for debounce (500ms) to trigger the API call, then wait for network to settle
    await page.waitForTimeout(600)
  },
}

/**
 * FileDetail - Helper functions for file detail page
 */
export const FileDetail = {
  async validateOrigin(page: Page, origin: string) {
    await expect(page.getByTestId('file-origin').filter({ hasText: origin })).toBeVisible()
  },
}

/**
 * SpacesList - Helper functions for spaces list page
 */
export const SpacesList = {
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

  async createPrivateSpaceIfNotExists(page: Page, spaceName: string, spaceDescription: string) {
    await SpacesList.searchSpace(page, spaceName, 'active')

    await page.waitForTimeout(2000)

    const spaceExists = await page.getByTestId('table-col-name').first().isVisible().catch(() => false)

    if (!spaceExists) {
      await expect(page.getByText('No spaces available.')).toBeVisible()

      await SpacesList.createPrivateSpace(page, spaceName, spaceDescription)
    }
  },

  async createPrivateSpace(page: Page, spaceName: string, spaceDescription: string) {
    await page.getByText(/^[ ]*Create Space$/).click()

    // Wait for the create space form to load
    await expect(page.getByRole('heading', { name: 'Create a new Space' })).toBeVisible()

    // Private is selected by default, but click the label if needed (the radio input is hidden)
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

/**
 * Delete file helper - clicks delete button and waits for success
 */
export async function deleteFileAndAwaitSuccess(page: Page) {
  await page.getByRole('button', { name: 'Delete' }).click()

  // Wait for delete operation to complete
  await page.waitForLoadState('networkidle')
}

/**
 * Wait for user compute resources to load
 */
export async function waitForComputeResources(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle')
}

/**
 * Helper to handle browser dialogs (confirm/alert) with automatic cleanup.
 * Use this when a test needs to accept dialogs on a shared page.
 * 
 * @example
 * ```ts
 * await withDialogHandler(page, async () => {
 *   await page.getByText('Delete').click()
 *   await expect(page.getByText('Deleted')).toBeVisible()
 * })
 * ```
 */
export async function withDialogHandler<T>(
  page: Page,
  fn: () => Promise<T>,
  action: 'accept' | 'dismiss' = 'accept'
): Promise<T> {
  const handler = (dialog: { accept: () => Promise<void>; dismiss: () => Promise<void> }) => {
    if (action === 'accept') {
      dialog.accept()
    } else {
      dialog.dismiss()
    }
  }
  
  page.on('dialog', handler)
  try {
    return await fn()
  } finally {
    page.off('dialog', handler)
  }
}
