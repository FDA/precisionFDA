import { test, expect } from './extend'
import path from 'node:path'
import {
  DataPortalsList,
  DataPortalForm,
  DataPortalDetail,
  DataPortalResources,
  DataPortalContent,
  UrlHelper,
  fixturesDir,
} from './helpers/data-portals.helpers'

/**
 * Data Portals Tests
 *
 * Tests for data portal CRUD operations including:
 * - Listing data portals
 * - Creating a new data portal
 * - Editing a data portal
 * - Uploading resources
 * - Adding content with images
 * - Deleting resources
 */

// Generate unique test identifier
// const testId = generateTestId()
const testId = '20251205112318'

// Get usernames from environment
const username = process.env.TEST_USER_USERNAME || ''
const guestLeadUsername = process.env.TEST_GUEST_LEAD_USERNAME || 'randall.ebert'

// Track the created data portal URL across tests
// When running individual tests, we can derive the URL from the testId
let createdDataPortalUrl = `/data-portals/cypress-data-portal-${testId}`

/**
 * Get the data portal URL - either from the stored value or derived from testId
 */
function getDataPortalUrl(): string {
  return createdDataPortalUrl || `/data-portals/cypress-data-portal-${testId}`
}

test.skip('Data Portals', () => {
  // Tests must run in serial order since they depend on each other
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/data-portals')
    await page.waitForLoadState('networkidle')
  })

  test('List Data Portals', async ({ page }) => {
    // Validate the list page is visible with H1
    await DataPortalsList.validateListPage(page)

    // Siteadmin can create portal - validate button is visible
    await expect(page.getByRole('link', { name: 'Create a Data Portal' })).toBeVisible()

    // Click to navigate to create form
    await DataPortalsList.clickCreateButton(page)

    // Validate create form page has H1
    await DataPortalForm.validateCreateFormPage(page)

    // Go back to list
    await DataPortalsList.clickBackToList(page)

    // Validate we're back on the list page
    await DataPortalsList.validateListPage(page)
  })

  test.skip('Create New Data Portal', async ({ page }) => {
    // Navigate to create form
    await DataPortalsList.clickCreateButton(page)

    // Submit empty form - button should be enabled initially, then disabled after validation
    await DataPortalForm.validateSubmitButtonEnabled(page)
    await DataPortalForm.submit(page)
    await DataPortalForm.validateSubmitButtonDisabled(page)

    // Fill in the form
    await DataPortalForm.fillName(page, `Cypress Data Portal ${testId}`)
    await DataPortalForm.fillDescription(page, 'Cypress Description')

    // Upload portal image
    const imagePath = path.join(fixturesDir, 'dataPortal.png')
    await DataPortalForm.uploadImage(page, imagePath)

    // Select host lead user
    await DataPortalForm.selectHostLead(page, username)

    // Select guest lead user
    await DataPortalForm.selectGuestLead(page, guestLeadUsername)

    // Set sort order
    await DataPortalForm.fillSortOrder(page, '999')

    // Submit the form
    await DataPortalForm.validateSubmitButtonEnabled(page)
    await DataPortalForm.submit(page)

    // Wait for creation to complete
    await page.waitForLoadState('networkidle')

    // Validate success toast
    await expect(page.getByText('Data Portal created')).toBeVisible()

    // Validate we navigated to the new data portal
    await expect(page.getByText(`Cypress Data Portal ${testId}`)).toBeVisible()

    // Store the URL for subsequent tests
    createdDataPortalUrl = page.url()

    // Validate the expected data portal slug is in the URL
    const dataPortalSlug = UrlHelper.getLastPathSegment(createdDataPortalUrl)
    expect(dataPortalSlug).toBe(`cypress-data-portal-${testId}`)
  })

  test.skip('Edit Data Portal', async ({ page }) => {
    // Navigate to the created data portal
    await page.goto(getDataPortalUrl())
    await page.waitForLoadState('networkidle')

    // Validate no content message
    await DataPortalDetail.validateNoContent(page)

    // Click Portal Settings link
    await DataPortalDetail.clickPortalSettings(page)

    // Edit the name - append " - Edited"
    await DataPortalForm.appendToName(page, ' - Edited')

    // Edit the description
    await DataPortalForm.clearAndFillDescription(page, 'Cypress Description - Edited')

    // Validate lead user inputs are disabled in edit mode
    await DataPortalForm.validateHostLeadDisabled(page)
    await DataPortalForm.validateGuestLeadDisabled(page)

    // Submit the form
    await DataPortalForm.validateSubmitButtonEnabled(page)
    await DataPortalForm.submit(page)

    // Wait for update to complete
    await page.waitForLoadState('networkidle')

    // Validate success toast
    await expect(page.getByText('Data Portal updated')).toBeVisible()

    // Validate edited name is visible
    await DataPortalDetail.validateName(page, `Cypress Data Portal ${testId} - Edited`)

    // Validate edited description is visible
    await DataPortalDetail.validateDescription(page, 'Cypress Description - Edited')
  })

  test.skip('Upload Data Portal Resources', async ({ page }) => {
    // Navigate to the created data portal
    await page.goto(getDataPortalUrl())
    await page.waitForLoadState('networkidle')

    // Click Resources link
    await DataPortalDetail.clickResources(page)

    // Click Upload Resources button
    await DataPortalResources.clickUploadResources(page)

    // Upload a resource file
    const resourcePath = path.join(fixturesDir, 'dataPortal.png')
    await DataPortalResources.uploadFile(page, resourcePath)

    // Submit the upload
    await DataPortalResources.submitUpload(page)

    // Wait for upload to complete
    await expect(page.getByText('All files have been processed')).toBeVisible({ timeout: 60000 })
  })

  test.skip('Add Data Portal Content', async ({ page }) => {
    // Navigate to the created data portal
    await page.goto(getDataPortalUrl())
    await page.waitForLoadState('networkidle')

    // Click Edit Content link
    await DataPortalDetail.clickEditContent(page)

    // Set content in the editor
    await DataPortalContent.setContent(page, 'Cypress Data Portal Content\n')

    // Insert an image from resources
    await DataPortalContent.clickInsert(page)
    await DataPortalContent.clickImageOption(page)

    // Select the first image
    await DataPortalContent.selectFirstImage(page)

    // Click Insert Image button
    await DataPortalContent.clickInsertImage(page)

    // Save the content
    await DataPortalContent.clickSave(page)

    // Wait for save to complete
    await page.waitForLoadState('networkidle')

    // Validate success toast
    await expect(page.getByText('Data Portal content updated')).toBeVisible()
  })

  test('Delete Data Portal Resources', async ({ page }) => {
    // Navigate to the created data portal
    await page.goto(getDataPortalUrl())
    await page.waitForLoadState('networkidle')

    // Click Resources link
    await DataPortalDetail.clickResources(page)

    // Search for the resource
    await DataPortalResources.searchResource(page, 'dataPortal')

    // Click on the resource
    await expect(page.getByText('dataPortal.png')).toBeVisible({ timeout: 60000 })
    await DataPortalResources.clickResource(page, 'dataPortal.png')

    // Handle the confirmation dialog and click Delete
    page.on('dialog', async dialog => {
      await dialog.accept()
    })
    await DataPortalResources.clickDelete(page)

    // Validate no resources found
    await DataPortalResources.validateNoResourcesFound(page)
  })
})
