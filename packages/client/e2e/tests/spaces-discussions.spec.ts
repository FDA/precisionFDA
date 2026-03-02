import { test, expect } from './fixtures/shared-page'
import path from 'node:path'
import fs from 'node:fs'
import { generateTestId, FilesList, FileDetail, createTestFile, fixturesDir } from './helpers/files.helpers'
import { SpacesList } from './helpers/spaces.helpers'
import { AppsList, AppDetail, RunAppForm, CreateAppForm, waitForComputeResources } from './helpers/apps.helpers'
import { DiscussionsList, DiscussionForm, DiscussionDetail } from './helpers/discussions.helpers'

/**
 * Spaces - Discussions in Spaces Tests
 *
 * Tests for creating discussions with various attachments (files, apps, jobs, comparisons),
 * adding/editing/deleting comments and answers in space discussions.
 *
 * Uses shared-page fixtures for faster serial test execution with SPA navigation.
 */

// Generate unique test identifier
const testId = generateTestId()
// let testId = '20251205082457'

// Get usernames from environment
const username = process.env.TEST_USER_USERNAME || ''
const guestLeadUsername = process.env.TEST_GUEST_LEAD_USERNAME || 'randall.ebert'

// Test file name
const cypressFile = `cypress-${testId}.txt`

// Space name for this test suite
const spaceName = `Cypress Group Space for Discussions`

// Discussion title for file attachment test (used across multiple tests)
let discussionWithFilesTitle = `Cypress Space Discussion with Files attachement ${testId}`
let spaceId: string

// Tests must run in serial order since they depend on each other
test.describe.configure({ mode: 'serial' })

test.describe('Spaces - Discussions in Spaces', () => {

  // These tests involve file uploads, app runs, and comparisons which can take time
  // test.beforeEach(async ({}, testInfo) => {
  //   testInfo.setTimeout(DISCUSSION_TIMEOUTS.comparisonComplete + 120000)
  // })

  test('Create Group Space', async ({ page, app }) => {
    await app.ensureRoute('/spaces')
    await SpacesList.createGroupSpaceIfNotExists(page, spaceName, 'Cypress Group Description', username, guestLeadUsername)
  })

  test('Upload file into space', async ({ page, app }) => {
    // Create test file
    const filePath = await createTestFile(cypressFile)

    await app.ensureRoute('/spaces')

    await SpacesList.searchSpaceOpenDetail(page, spaceName)

    // Capture space ID for direct navigation in subsequent tests
    const match = page.url().match(/\/spaces\/(\d+)/)
    if (match) spaceId = match[1]

    // Click Add Files button
    await page.getByTestId('home-files-add-files-button').click()

    // Click Upload Files option inside the Add Files modal (toolbar also has "Upload Files")
    await page.getByTestId('choose-add-file-option-modal').getByRole('button', { name: 'Upload Files' }).click()

    // Wait for modal to be visible
    await expect(page.getByTestId('modal-files-upload')).toBeVisible()

    // Select file to upload using the file input
    await page.getByTestId('upload-modal-file-input').setInputFiles(filePath)

    // Verify file appears in the list
    await expect(page.getByTestId('upload-modal-file-row')).toBeVisible()

    // Click Upload button
    await page.getByTestId('upload-modal-upload').click()

    // Wait for upload to complete - the Close button appears when finished
    await expect(page.getByTestId('upload-modal-close')).toBeVisible({ timeout: 120000 })

    // Close the upload modal
    await page.getByTestId('upload-modal-close').click()
    await expect(page.getByTestId('modal-files-upload')).not.toBeVisible()

    // Wait for the toast to disappear and page to settle
    await page.waitForTimeout(1500)
    await page.waitForLoadState('networkidle')

    // Ensure we're on the Files tab by clicking it (in case the modal close triggered a navigation)
    await page.getByTestId('files-link').click()
    await page.waitForLoadState('networkidle')

    // Search and open file detail (waits for file size to show bytes, meaning file is closed)
    await FilesList.searchFileAndOpenDetailWhenClosed(page, cypressFile)

    await FileDetail.validateName(page, cypressFile)
    await FileDetail.validateLocation(page, `${spaceName} - Shared`)
  })

  test('Create Discussion with Files attachment', async ({ page, app }) => {
    await app.ensureRoute(`/spaces/${spaceId}/discussions`)

    await DiscussionsList.startDiscussion(page)

    await DiscussionForm.fill(page, discussionWithFilesTitle, `Cypress Content${testId}`)

    // Select Files attachment
    await DiscussionForm.openAttachmentSelector(page)
    await DiscussionForm.selectAttachmentType(page, 'Files')
    await DiscussionForm.filterAndSelectAttachment(page, cypressFile)
    await DiscussionForm.confirmAttachmentSelection(page)

    await DiscussionForm.submit(page)

    await DiscussionDetail.validateFileAttachment(page, cypressFile)
  })

  test.skip('Create Discussion with Apps attachment', async ({ page, app }) => {
    const appName = `cypress_discussion_app_${testId}`
    const appTitle = `Cypress Discussion App ${testId}`

    // First, create an app
    await app.ensureRoute('/home/apps')

    const computeResourcesPromise = waitForComputeResources(page)
    await page.getByTestId('home-apps-create-button').click()
    await computeResourcesPromise

    await page.locator('input[name="name"]').fill(appName)
    await page.locator('input[name="title"]').fill(appTitle)

    await CreateAppForm.setUbuntuRelease(page, '24.04')

    await page.getByRole('button', { name: 'Create App' }).click()
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Your app was created successfully')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Run App' })).toBeVisible()

    // Navigate to space and add the app
    await app.ensureRoute(`/spaces/${spaceId}`)

    await page.getByTestId('apps-link').click()
    await page.waitForTimeout(1500)
    await page.waitForLoadState('networkidle')

    // Clear the name filter that may have been carried over from the space search
    const filterInput = page.getByTestId('table-filter-name').getByRole('textbox')
    await filterInput.clear()
    await page.waitForLoadState('networkidle')

    await page.getByTestId('spaces-apps-add-app-button').click()

    // Find and select the app row
    const appRow = page.getByTestId('data-row').filter({
      has: page.getByTestId('table-col-name').filter({ hasText: appName })
    })
    await appRow.getByTestId('row-checkbox').click()

    await page.getByRole('button', { name: 'Add to Space' }).click()

    await expect(page.getByText('Successfully')).toBeVisible()

    // Click on the app to open it
    await page.getByRole('link', { name: appName }).click()

    // Run the app
    const computeResourcesRunPromise = waitForComputeResources(page)
    await page.getByRole('button', { name: 'Run App' }).click()
    await computeResourcesRunPromise

    await RunAppForm.prepare(page)
    
    // Set space scope
    await page.locator('#select_context').click()
    await page.waitForTimeout(1000)
    await page.keyboard.type(spaceName)
    await page.waitForTimeout(2000)
    await page.keyboard.press('Enter')

    await RunAppForm.send(page)

    await expect(page.getByRole('button', { name: 'Re-Run Execution' })).toBeVisible()

    // Now create a discussion with App attachment
    await app.ensureRoute(`/spaces/${spaceId}/discussions`)
    await DiscussionsList.startDiscussion(page)

    await DiscussionForm.fill(
      page,
      `Cypress Space Discussion with App attachement ${testId}`,
      `Cypress Content ${testId}`
    )

    await DiscussionForm.openAttachmentSelector(page)
    await DiscussionForm.selectAttachmentType(page, 'Apps')
    await DiscussionForm.filterAndSelectAttachment(page, appTitle, 'Select Apps')
    await DiscussionForm.confirmAttachmentSelection(page, 'Select Apps')

    await DiscussionForm.submit(page)

    // Delete the discussion after verifying it was created
    await DiscussionDetail.deleteDiscussion(page)
  })

  test.skip('Create Discussion with Job attachment', async ({ page, app }) => {
    const appName = `cypress_discussion_app_${testId}`

    await app.ensureRoute(`/spaces/${spaceId}/discussions`)

    await DiscussionsList.startDiscussion(page)

    await DiscussionForm.fill(
      page,
      `Cypress Space Discussion with Job attachement ${testId}`,
      `Cypress Content ${testId}`
    )

    await DiscussionForm.openAttachmentSelector(page)
    await DiscussionForm.selectAttachmentType(page, 'Jobs')
    await DiscussionForm.filterAndSelectAttachment(page, appName, 'Select Jobs')
    await DiscussionForm.confirmAttachmentSelection(page, 'Select Jobs')

    await DiscussionForm.submit(page)

    // Delete the discussion after verifying it was created
    await DiscussionDetail.deleteDiscussion(page)
  })

  test('Upload vcf files', async ({ page, app }) => {
    await app.ensureRoute('/home/files')

    // Check if benchmarkSet.vcf exists, if not upload it
    await FilesList.searchFile(page, 'benchmarkSet.vcf')
    const benchmarkExists = await page.getByTestId('table-col-name').filter({ hasText: 'benchmarkSet.vcf' }).isVisible().catch(() => false)

    if (!benchmarkExists) {
      // Upload benchmarkSet.vcf from fixtures
      const benchmarkPath = path.join(fixturesDir, 'comparison/benchmarkSet.vcf')
      if (fs.existsSync(benchmarkPath)) {
        // In home files (not space), clicking Add Files button directly opens the upload modal
        await page.getByTestId('home-files-add-files-button').click()
        await expect(page.getByTestId('modal-files-upload')).toBeVisible()
        await page.getByTestId('upload-modal-file-input').setInputFiles(benchmarkPath)
        await page.getByTestId('upload-modal-upload').click()
        await expect(page.getByTestId('upload-modal-close')).toBeVisible({ timeout: 120000 })
        await page.getByTestId('upload-modal-close').click()
      }
    }

    // Check if testSet.vcf exists, if not upload it
    await FilesList.searchFile(page, 'testSet.vcf')
    const testSetExists = await page.getByTestId('table-col-name').filter({ hasText: 'testSet.vcf' }).isVisible().catch(() => false)

    if (!testSetExists) {
      // Upload testSet.vcf from fixtures
      const testSetPath = path.join(fixturesDir, 'comparison/testSet.vcf')
      if (fs.existsSync(testSetPath)) {
        // In home files (not space), clicking Add Files button directly opens the upload modal
        await page.getByTestId('home-files-add-files-button').click()
        await expect(page.getByTestId('modal-files-upload')).toBeVisible()
        await page.getByTestId('upload-modal-file-input').setInputFiles(testSetPath)
        await page.getByTestId('upload-modal-upload').click()
        await expect(page.getByTestId('upload-modal-close')).toBeVisible({ timeout: 120000 })
        await page.getByTestId('upload-modal-close').click()
      }
    }
  })

  test.skip('Create Discussion with Comparisons attachment', async ({ page, app }) => {
    // Navigate to comparisons page (Rails page)
    await app.ensureRoute('/comparisons')

    // Click Run Comparison button
    await page.getByRole('link', { name: 'Run Comparison' }).click()
    await page.waitForLoadState('networkidle')

    // Select test VCF file
    await page.locator('div.variant-test button').filter({ hasText: 'Select File' }).first().click()
    await page.getByText('Files').first().click()
    await page.waitForLoadState('networkidle')

    await page.locator('.object-selector-modal .input-group input[type="text"]').fill('testSet.vcf')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Click on the list item containing the file to select it (uses list-group-item structure)
    await page.locator('.object-selector-modal .list-group-item').filter({ hasText: 'testSet.vcf' }).first().click()
    await page.waitForTimeout(500)
    // Click the Select button in the modal footer
    await page.locator('.object-selector-modal .modal-footer button.btn-primary').filter({ hasText: 'Select' }).first().click()

    // Wait for the modal to close before selecting the next file
    await page.locator('.object-selector-modal.show').waitFor({ state: 'hidden', timeout: 15000 }).catch(async () => {
      // If modal doesn't close, try pressing Escape
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    })
    await page.waitForLoadState('networkidle')

    // Verify the test file was selected (button now shows the file name)
    await expect(page.locator('div.variant-test button.btn-primary').filter({ hasText: 'testSet.vcf' })).toBeVisible({ timeout: 10000 })

    // Select benchmark VCF file
    await page.locator('div.variant-ref button').filter({ hasText: 'Select File' }).first().click()
    await page.getByText('Files').first().click()
    await page.waitForLoadState('networkidle')

    await page.locator('.object-selector-modal .input-group input[type="text"]').fill('benchmarkSet.vcf')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Click on the list item containing the file to select it
    await page.locator('.object-selector-modal .list-group-item').filter({ hasText: 'benchmarkSet.vcf' }).first().click()
    await page.waitForTimeout(500)
    // Click the Select button in the modal footer
    await page.locator('.object-selector-modal .modal-footer button.btn-primary').filter({ hasText: 'Select' }).first().click()

    // Wait for the modal to close
    await page.locator('.object-selector-modal.show').waitFor({ state: 'hidden', timeout: 15000 }).catch(async () => {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    })
    await page.waitForLoadState('networkidle')

    // Verify the benchmark file was selected (button now shows the file name)
    await expect(page.locator('div.variant-ref button.btn-primary').filter({ hasText: 'benchmarkSet.vcf' })).toBeVisible({ timeout: 10000 })

    // Wait for the compare link to appear (only shows when both files are selected)
    await expect(page.locator('a.variants-circle-compare')).toBeVisible({ timeout: 10000 })

    // Click compare link (the circular button between the two file selectors)
    await page.locator('a.variants-circle-compare').click()

    // Wait for the comparison modal to be visible
    await page.locator('#comparison-modal').waitFor({ state: 'visible', timeout: 10000 })
    await page.waitForTimeout(500)

    // The name field is auto-filled with "testSet.vcf vs benchmarkSet.vcf", append our testId
    const nameInput = page.locator('input[name="comparison[name]"]')
    const currentName = await nameInput.inputValue()
    await nameInput.fill(`${currentName} - ${testId}`)
    await page.locator('textarea[placeholder="Describe this comparison (optional)..."]').fill(`Cypress Comparison ${testId}`)

    // Wait for the Start Comparison button to be enabled (not disabled)
    const startButton = page.locator('#comparison-modal .modal-footer button.btn-primary').filter({ hasText: 'Start Comparison' })
    await expect(startButton).not.toHaveClass(/disabled/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // Click Start Comparison
    await startButton.click()

    // Wait for the modal to close and comparison to be created
    await page.locator('#comparison-modal').waitFor({ state: 'hidden', timeout: 30000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // The comparison may show as pending or may have already started processing
    // Navigate to the comparisons list to find our comparison
    await app.ensureRoute('/comparisons')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Find and click on our comparison link (contains the testId in the name)
    // The comparison name is "testSet.vcf vs benchmarkSet.vcf - {testId}"
    await page.getByRole('link', { name: new RegExp(testId) }).first().click()
    await page.waitForLoadState('networkidle')

    // Wait for comparison to complete (with retries)
    let attempts = 0
    const maxAttempts = 4
    const waitTimes = [180000, 90000, 60000, 30000]

    while (attempts < maxAttempts) {
      const isWarning = await page.locator('div.page-title span.label-warning').isVisible().catch(() => false)
      if (!isWarning) {
        break
      }

      console.log(`Comparison not done. Waiting ${waitTimes[attempts] / 1000}s...`)
      await page.waitForTimeout(waitTimes[attempts])
      await page.reload()
      await page.waitForLoadState('networkidle')
      attempts++
    }

    await expect(page.locator('div.page-title span.label').filter({ hasText: 'DONE' })).toBeVisible()

    // Publish the comparison
    await page.getByText('Publish publicly').click()
    await page.getByText('Publish selected objects').click()

    await expect(page.locator('div.metadata-header p').filter({ hasText: 'Public' })).toBeVisible()

    // Now create a discussion with Comparison attachment
    await app.ensureRoute(`/spaces/${spaceId}/discussions`)

    await DiscussionsList.startDiscussion(page)

    await DiscussionForm.fill(
      page,
      `Cypress Space Discussion with Comparisons attachement ${testId}`,
      `Cypress Content${testId}`
    )

    await DiscussionForm.openAttachmentSelector(page)
    await DiscussionForm.selectAttachmentType(page, 'Comparisons')
    await DiscussionForm.filterAndSelectAttachment(page, `testSet.vcf vs benchmarkSet.vcf - ${testId}`, 'Select Comparisons')
    await DiscussionForm.confirmAttachmentSelection(page, 'Select Comparisons')

    await DiscussionForm.submit(page)

    // Delete the discussion after verifying it was created
    await DiscussionDetail.deleteDiscussion(page)
  })

  test.skip('Add Comment', async ({ page, app }) => {
    await app.ensureRoute(`/spaces/${spaceId}/discussions`)

    await DiscussionsList.openDiscussion(page, discussionWithFilesTitle)

    await DiscussionDetail.addComment(page, 'Cypress Comment')
  })

  test.skip('Edit Comment', async ({ page, app }) => {
    await app.ensureRoute(`/spaces/${spaceId}/discussions`)

    await DiscussionsList.openDiscussion(page, discussionWithFilesTitle)

    await DiscussionDetail.editComment(page, 'Cypress Comment - Edited')
  })

  test.skip('Delete Comment', async ({ page, app }) => {
    await app.ensureRoute(`/spaces/${spaceId}/discussions`)

    await DiscussionsList.openDiscussion(page, discussionWithFilesTitle)

    await DiscussionDetail.deleteComment(page, 'last')

    await DiscussionDetail.validateCommentsAndAnswersCount(page, 0, 0)
  })

  test('Add Answer', async ({ page, app }) => {
    await app.ensureRoute(`/spaces/${spaceId}/discussions`)

    await DiscussionsList.openDiscussion(page, discussionWithFilesTitle)

    await DiscussionDetail.addAnswer(page, 'Cypress Answer')
  })

  test('Edit Answer', async ({ page, app }) => {
    await app.ensureRoute(`/spaces/${spaceId}/discussions`)

    await DiscussionsList.openDiscussion(page, discussionWithFilesTitle)

    await DiscussionDetail.editAnswer(page, 'Cypress Answer - Edited', 'last')
  })

  test('Add Reply to Answer', async ({ page, app }) => {
    await app.ensureRoute(`/spaces/${spaceId}/discussions`)

    await DiscussionsList.openDiscussion(page, discussionWithFilesTitle)

    await DiscussionDetail.addReplyToAnswer(page, 'Cypress Reply to Answer')
  })

  test('Delete Reply', async ({ page, app }) => {
    await app.ensureRoute(`/spaces/${spaceId}/discussions`)

    await DiscussionsList.openDiscussion(page, discussionWithFilesTitle)

    await DiscussionDetail.deleteComment(page, 'first')

    await DiscussionDetail.validateCommentsAndAnswersCount(page, 0, 1)
  })

  test('Delete Answer', async ({ page, app }) => {
    await app.ensureRoute(`/spaces/${spaceId}/discussions`)

    await DiscussionsList.openDiscussion(page, discussionWithFilesTitle)

    await DiscussionDetail.deleteAnswer(page, 'first')

    await DiscussionDetail.validateCommentsAndAnswersCount(page, 0, 0)
  })

  test('Delete Discussion', async ({ page, app }) => {
    await app.ensureRoute(`/spaces/${spaceId}/discussions`)

    await DiscussionsList.openDiscussion(page, discussionWithFilesTitle)

    await DiscussionDetail.deleteDiscussion(page)
  })

  test('Delete uploaded file', async ({ page, app }) => {
    await app.ensureRoute(`/spaces/${spaceId}`)

    await FilesList.searchFileAndOpenDetail(page, cypressFile)

    await FileDetail.clickActionsMenuItem(page, 'Delete')

    await page.getByRole('button', { name: 'Delete' }).click()
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Successfully deleted')).toBeVisible({ timeout: 90000 })
  })

  test.skip('Delete application from space', async ({ page, app }) => {
    const appName = `cypress_discussion_app_${testId}`
    const appTitle = `Cypress Discussion App ${testId}`

    await app.ensureRoute(`/spaces/${spaceId}`)

    await page.getByTestId('apps-link').click()
    await page.waitForTimeout(1500)
    await page.waitForLoadState('networkidle')

    await AppsList.searchAppAndOpenDetail(page, appName, appTitle)

    await AppDetail.clickActionsMenuItem(page, 'Delete')

    await page.getByRole('button', { name: 'Delete' }).click()

    await expect(page.getByText('Deleted 1 app')).toBeVisible()
  })
})
