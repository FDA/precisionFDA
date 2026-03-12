import { test, expect } from './fixtures/shared-page'
import path from 'node:path'
import fs from 'node:fs'
import {
  FilesList,
  FileDetail,
  SpacesList,
  UrlHelper,
  downloadsDir,
  clickFileDeleteButtonAndAwaitSuccess,
  deleteFileFromMyHome,
  createTestFile,
} from './helpers/files.helpers'

// Unique test ID for this file (generated once, shared across all tests)
const testId = Date.now().toString(36)

/**
 * My Home - Folders & Files Tests
 *
 * Tests folder and file operations in the My Home section including:
 * - Creating, editing, moving, and deleting folders
 * - Uploading, downloading, and managing files
 * - Tags, properties, and comments on files
 * - Copy to space functionality
 * - Making files public
 *
 * Uses shared-page fixtures for faster serial test execution with SPA navigation.
 * Uses testId (module-scoped) for unique resource names across tests.
 */

// Get username from environment
const username = process.env.TEST_USER_USERNAME || ''

// These tests must run in serial order since they depend on each other
test.describe.configure({ mode: 'serial' })

// File names using testId
const fileName = `my-home-file-${testId}.txt`
const everyoneFile = `everyone-${testId}.txt`

test.describe('My Home - Folders & Files', () => {
  test('Add Folder', async ({ page, app }) => {
    await app.ensureRoute('/home/files')
    await page.getByTestId('home-files-add-folder-button').click()

    await page.locator('input[name="name"]').fill(`Cypress Folder ${testId}`)

    await page.locator('button[type="submit"][form="add-folder-form"]').click()

    await expect(page.getByText('Folder has been created')).toBeVisible()
  })

  test('Edit Folder', async ({ page, app }) => {
    await app.ensureRoute('/home/files')
    await FilesList.searchFile(page, `Cypress Folder ${testId}`)

    // Find the row containing the folder we want and click its checkbox
    const folderRow = page.getByTestId('data-row').filter({ hasText: `Cypress Folder ${testId}` }).first()
    await expect(folderRow).toBeVisible()
    // Click the row checkbox label
    await page.waitForTimeout(500)
    await folderRow.getByTestId('row-checkbox').click()
    await page.waitForTimeout(500)

    // Wait for selection to be registered

    await page.getByTestId('home-files-actions-button').click()

    // Wait for menu to be visible
    const editMenuItem = page.getByRole('menuitem', { name: 'Edit folder info' })
    await expect(editMenuItem).toBeVisible()
    await editMenuItem.click()

    // Cancel first time
    await page.getByRole('button', { name: 'Cancel' }).click()

    // Wait for the modal to fully close before clicking the actions button again
    await expect(page.getByRole('dialog')).toBeHidden()

    // Open again
    await page.getByTestId('home-files-actions-button').click()
    const editMenuItem2 = page.getByRole('menuitem', { name: 'Edit folder info' })
    await expect(editMenuItem2).toBeVisible()
    await editMenuItem2.click()

    // Wait for input to be enabled

    // Edit the folder name
    await page.locator('input[name="name"]').fill(`Cypress Folder ${testId} - Edited`)

    await page.getByTestId('modal-folder-edit').getByRole('button', { name: 'Edit' }).click()

    await expect(page.getByText('Folder info changed')).toBeVisible()
  })

  test('Create folder 2', async ({ page, app }) => {
    await app.ensureRoute('/home/files')
    await page.getByTestId('home-files-add-folder-button').click()

    await page.locator('input[name="name"]').fill(`Cypress Folder ${testId}-2`)

    await page.locator('button[type="submit"][form="add-folder-form"]').click()

    await expect(page.getByText('Folder has been created')).toBeVisible()
  })

  test('Move', async ({ page, app }) => {
    await app.ensureRoute('/home/files')
    await FilesList.searchFile(page, `Cypress Folder ${testId}-2`)

    // Find the row containing the folder we want and click its checkbox
    const folderRow = page.getByTestId('data-row').filter({ hasText: `Cypress Folder ${testId}-2` }).first()
    await expect(folderRow).toBeVisible()
    // Wait for row to be ready for interaction
    await page.waitForTimeout(500)
    await folderRow.getByTestId('row-checkbox').click()

    // Wait for selection to register before clicking actions
    await page.waitForTimeout(300)
    
    const actionsButton = page.getByTestId('home-files-actions-button')
    await expect(actionsButton).toBeEnabled()
    await actionsButton.click()

    // Wait for menu to be visible
    const moveMenuItem = page.getByRole('menuitem', { name: 'Move' })
    await expect(moveMenuItem).toBeVisible()
    await moveMenuItem.click()

    // Expand the folder tree
    await page.locator('span.rc-tree-switcher').click()

    // Wait for children folders to load
    await page.waitForLoadState('networkidle')

    // Select the target folder
    await page.locator(`span[title="Cypress Folder ${testId} - Edited"]`).click()

    await page.getByRole('button', { name: 'Move' }).click()

    // Wait for move to complete
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Successfully moved 1 item')).toBeVisible()
  })

  test('Delete Folder', async ({ page, app }) => {
    await app.ensureRoute('/home/files')
    await FilesList.searchFile(page, `Cypress Folder ${testId}`)

    // Find the row containing the folder we want and click its checkbox
    const folderRow = page.getByTestId('data-row').filter({ hasText: `Cypress Folder ${testId}` }).first()
    await expect(folderRow).toBeVisible()
    await folderRow.getByTestId('row-checkbox').click()

    await page.getByTestId('home-files-actions-button').click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()

    await clickFileDeleteButtonAndAwaitSuccess(page)
  })

  test('Add Files', async ({ page, app }) => {
    test.setTimeout(150000)

    await app.ensureRoute('/home/files')
    
    // Create test files
    const file1Path = await createTestFile(fileName)
    const file2Path = await createTestFile(everyoneFile)

    // Click Add Files to open the multi-file upload modal
    await page.getByTestId('home-files-add-files-button').click()
    
    // Wait for modal to be visible
    await expect(page.getByTestId('modal-files-upload')).toBeVisible()
    
    // Verify dropzone is visible
    await expect(page.getByTestId('upload-modal-dropzone')).toBeVisible()
    
    // Verify initial status shows 0 files
    await expect(page.getByTestId('upload-modal-status')).toContainText('0 Files Ready to Upload')

    // Close modal first to test close functionality
    await page.getByTestId('modal-close-button').click()
    await expect(page.getByTestId('modal-files-upload')).not.toBeVisible()

    // Reopen the upload modal
    await page.getByTestId('home-files-add-files-button').click()
    await expect(page.getByTestId('modal-files-upload')).toBeVisible()

    // Select first file using the file input
    await page.getByTestId('upload-modal-file-input').setInputFiles(file1Path)
    
    // Verify file appears in the file list with pending status
    await expect(page.getByTestId('upload-modal-file-list')).toBeVisible()
    await expect(page.getByTestId('upload-modal-file-row')).toBeVisible()
    await expect(page.getByTestId('file-status-pending')).toBeVisible()
    
    // Verify status shows 1 file
    await expect(page.getByTestId('upload-modal-status')).toContainText('1 File Ready to Upload')

    // Remove all files
    await page.getByTestId('upload-modal-remove-all').click()
    
    // Verify file list is empty (no rows visible)
    await expect(page.getByTestId('upload-modal-file-row')).not.toBeVisible()
    
    // Verify status shows 0 files
    await expect(page.getByTestId('upload-modal-status')).toContainText('0 Files Ready to Upload')

    // Select both files
    await page.getByTestId('upload-modal-file-input').setInputFiles([file1Path, file2Path])
    
    // Verify both files appear in the list
    await expect(page.getByTestId('upload-modal-file-row')).toHaveCount(2)
    
    // Verify status shows 2 files
    await expect(page.getByTestId('upload-modal-status')).toContainText('2 Files Ready to Upload')

    // Click Upload button
    await page.getByTestId('upload-modal-upload').click()

    // Wait for uploads to complete - the Close button appears when finished
    await expect(page.getByTestId('upload-modal-close')).toBeVisible({ timeout: 120000 })
    
    // Verify completed status shows in footer
    await expect(page.getByTestId('upload-modal-status')).toContainText('2/2 Completed')
    
    // Close the upload modal
    await page.getByTestId('upload-modal-close').click()
    await expect(page.getByTestId('modal-files-upload')).not.toBeVisible()

    // Verify first file
    await FilesList.searchFileAndOpenDetailWhenClosed(page, fileName)
    await page.waitForTimeout(5000)
    await page.reload()
    await FileDetail.validateAddedByUsername(page, username)
    await FileDetail.validateOrigin(page, 'Uploaded')
    await FileDetail.validateSize(page, '11 Bytes')

    // Go back and verify second file
    await page.goBack()

    await FilesList.searchFileAndOpenDetailWhenClosed(page, everyoneFile)

    await FileDetail.validateAddedByUsername(page, username)
    await FileDetail.validateOrigin(page, 'Uploaded')
    await FileDetail.validateSize(page, '11 Bytes')
  })

  test('Filtering', async ({ page, app }) => {
    await app.ensureRoute('/home/files')
    await FilesList.searchFile(page, 'non-existing-filename')

    await expect(page.getByText("You don't have any files yet.")).toBeVisible()

    await FilesList.searchFileAndOpenDetail(page, fileName)

    await FileDetail.validateBackToFilesLink(page)
    await FileDetail.validateName(page, fileName)
    await FileDetail.validateDescription(page, 'No description provided.')
    await FileDetail.validateIsNotLocked(page)
    await FileDetail.validateLocation(page, 'Private')

    const fileId = UrlHelper.getLastPathSegment(page.url())
    await FileDetail.validateId(page, fileId)

    await FileDetail.validateAddedByUsername(page, username)
    await FileDetail.validateOrigin(page, 'Uploaded')
    await FileDetail.validateSize(page, '11 Bytes')
  })

  test('Track File', async ({ page, app }) => {
    await app.ensureRoute('/home/files')
    await FilesList.searchFileAndOpenDetail(page, fileName)

    await FileDetail.validateSize(page, '11 Bytes')

    await FileDetail.clickActionsMenuItem(page, 'Track')

    await expect(page.getByText('Learn more about tracking')).toBeVisible()
  })

  test('Open File', async ({ page, app }) => {
    await app.ensureRoute('/home/files')
    await FilesList.searchFileAndOpenDetail(page, fileName)

    // With a single file selected, Open opens in a new tab directly (no modal)
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      FileDetail.clickActionsMenuItem(page, 'Open'),
    ])

    // Wait for the new page to load and verify content
    await newPage.waitForLoadState('networkidle')
    await expect(newPage.locator('pre').filter({ hasText: /^Hello World$/ })).toBeVisible()

    await newPage.close()
  })

  test('Make File Public', async ({ page, app }) => {
    await app.ensureRoute('/home/files')
    await FilesList.searchFileAndOpenDetail(page, everyoneFile)

    const originFileId = await page.getByTestId('file-uid').textContent()
    const expectedFileId = originFileId!.slice(0, -1) + '2'

    await FileDetail.clickActionsMenuItem(page, 'Make public')

    await page.getByText('Publish selected objects').click()

    // Wait for publish to complete
    await page.waitForLoadState('networkidle')

    const publishedFileId = await page.getByTestId('file-uid').textContent()
    expect(publishedFileId).toBe(expectedFileId)

    await FileDetail.validateLocation(page, 'Public')

    // Check in Everyone tab
    await page.getByTestId('everyone-button').click()

    await FilesList.searchFileAndOpenDetail(page, everyoneFile)

    const everyoneFileId = await page.getByTestId('file-uid').textContent()
    expect(everyoneFileId).toBe(expectedFileId)

    await FileDetail.validateLocation(page, 'Public')
  })

  test('Download File', async ({ page, app }) => {
    await app.ensureRoute('/home/files?scope=me')
    await FilesList.searchFileAndOpenDetail(page, fileName)
    await page.waitForTimeout(500)
    await FileDetail.clickActionsMenuItem(page, 'Download')

    // Start download and wait for it
    const downloadPromise = page.waitForEvent('download')
    await page.locator('table button', { hasText: 'Download' }).click()
    const download = await downloadPromise

    // Save and verify the file
    const downloadPath = path.join(downloadsDir, fileName)
    await download.saveAs(downloadPath)
    
    const content = fs.readFileSync(downloadPath, 'utf-8')
    expect(content).toBe('Hello World')

    // Cancel the dialog
    await page.getByRole('button', { name: 'Cancel' }).click()
  })

  test('Copy to Space', async ({ page, app }) => {
    // Ensure there is a space to copy to
    await app.ensureRoute('/spaces')

    await SpacesList.createPrivateSpaceIfNotExists(
      page,
      'Cypress Private Space for "copy to space" action',
      'Cypress Private',
    )

    await app.ensureRoute('/home/files')

    await FilesList.searchFileAndOpenDetail(page, fileName)

    await FileDetail.clickActionsMenuItem(page, 'Copy to...')

    await page.locator('input[placeholder="Search spaces..."]').fill('Cypress Private Space for "copy to space" action')

    await page.waitForTimeout(1000)
    await page.getByText('Cypress Private Space for "copy to space" action').click()

    // Wait for copy API to succeed
    const copyPromise = page.waitForResponse(
      response => response.url().includes('/api/') && response.url().includes('copy') && response.status() === 200,
    )

    await page.getByRole('button', { name: 'Copy', exact: true }).click()

    await copyPromise

    // Open the space and verify the copied file
    await app.ensureRoute('/spaces')

    await SpacesList.searchSpaceOpenDetail(page, 'Cypress Private Space for "copy to space" action')

    await FilesList.searchFileAndOpenDetail(page, fileName)

    await FileDetail.validateAddedByUsername(page, username)
    await FileDetail.validateName(page, fileName)
    await FileDetail.validateOrigin(page, fileName)
    await FileDetail.validateLocation(page, 'Cypress Private Space for "copy to space" action - Private')
    await FileDetail.validateSize(page, '11 Bytes')
  })

  test('Add Tags', async ({ page, app }) => {
    await app.ensureRoute('/home/files')
    await FilesList.searchFileAndOpenDetail(page, fileName)

    await FileDetail.addTagsTest(page)
  })

  test('Add Properties', async ({ page, app }) => {
    await app.ensureRoute('/home/files')
    await FilesList.searchFileAndOpenDetail(page, fileName)

    await FileDetail.addPropertiesTest(page)
  })

  test('Edit Properties', async ({ page, app }) => {
    await app.ensureRoute('/home/files')
    await FilesList.searchFileAndOpenDetail(page, fileName)

    await FileDetail.editPropertiesTest(page)
  })

  test('Delete Properties', async ({ page, app }) => {
    await app.ensureRoute('/home/files')
    await FilesList.searchFileAndOpenDetail(page, fileName)

    await FileDetail.deletePropertiesTest(page)
  })

  test('Add Comment', async ({ page, app }) => {
    await app.goto('/home/files')
    await FilesList.searchFileAndOpenDetail(page, fileName)

    await FileDetail.clickActionsMenuItem(page, 'Comments')

    await page.locator('#comment_body').fill('Cypress Comment')

    await page.locator('input[data-disable-with="Commenting..."]').click()

    await expect(page.getByText('Cypress Comment')).toBeVisible()
  })

  test('Edit Comment', async ({ page, app }) => {
    await app.goto('/home/files')
    await FilesList.searchFileAndOpenDetail(page, fileName)

    await FileDetail.clickActionsMenuItem(page, 'Comments')

    await page.locator('a', { hasText: 'Edit' }).click()

    await expect(page.getByText('Edit your comment on file:')).toBeVisible()

    await page.locator('#comment_body').fill('Cypress Comment - Edited')

    await page.locator('input[data-disable-with="Commenting..."]').click()

    await expect(page.getByText('Cypress Comment - Edited')).toBeVisible()
  })

  test('Delete Comment', async ({ page, app }) => {
    await app.ensureRoute('/home/files')
    await FilesList.searchFileAndOpenDetail(page, fileName)

    await FileDetail.clickActionsMenuItem(page, 'Comments')

    await page.locator('a', { hasText: 'Delete' }).click()

    await expect(page.getByText('No comments yet.')).toBeVisible()
  })

  test('Copy file with tags and properties to space', async ({ page, app }) => {
    // Ensure there is a space to copy to
    await app.goto('/spaces')

    await SpacesList.createPrivateSpaceIfNotExists(
      page,
      'Cypress Private Space for "copy to space" action',
      'Cypress Private',
    )

    await app.ensureRoute('/home/files')

    await FilesList.searchFileAndOpenDetail(page, everyoneFile)

    await FileDetail.addTagsTest(page)
    // TODO: remove when PFDA-6609 is merged
    // await FileDetail.addPropertiesTest(page)

    await FileDetail.clickActionsMenuItem(page, 'Copy to...')

    await page.locator('input[placeholder="Search spaces..."]').fill('Cypress Private Space for "copy to space" action')

    await page.waitForTimeout(1000)
    await page.getByText('Cypress Private Space for "copy to space" action').click()

    // Wait for copy API to succeed
    const copyPromise = page.waitForResponse(
      response => response.url().includes('/api/') && response.url().includes('copy') && response.status() === 200,
    )

    await page.getByRole('button', { name: 'Copy', exact: true }).click()

    await copyPromise

    // Open the space and verify the copied file
    await app.ensureRoute('/spaces')

    await SpacesList.searchSpaceOpenDetail(page, 'Cypress Private Space for "copy to space" action')

    await FilesList.searchFileAndOpenDetail(page, everyoneFile)

    await FileDetail.validateAddedByUsername(page, username)
    await FileDetail.validateName(page, everyoneFile)
    await FileDetail.validateOrigin(page, everyoneFile)
    await FileDetail.validateLocation(page, 'Cypress Private Space for "copy to space" action - Private')
    await FileDetail.validateSize(page, '11 Bytes')

    // TODO: remove when PFDA-6609 is merged
    // await FileDetail.validateProperty(page, 'Cypress Property Key', 'Cypress Property Value')
    // await FileDetail.validateProperty(page, 'Cypress Second Property Key', 'Cypress Second Property Value')

    await FileDetail.validateTag(page, 'Cypress Tag')
    await FileDetail.validateTag(page, 'Cypress Second Tag')
  })

  test('Delete My Home Private File', async ({ page, app }) => {
    await app.ensureRoute('/home/files')
    await deleteFileFromMyHome(page, fileName)
  })

  test('Delete Everyone Private File', async ({ page, app }) => {
    await app.ensureRoute('/home/files')
    await deleteFileFromMyHome(page, everyoneFile)
  })

  test('Delete Everyone Public File', async ({ page, app }) => {
    await app.ensureRoute('/home/files')
    await deleteFileFromMyHome(page, everyoneFile, 'everybody')
  })
})
