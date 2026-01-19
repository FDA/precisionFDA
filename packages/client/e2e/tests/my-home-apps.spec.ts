import { test, expect } from './fixtures/shared-page'
import { Page } from 'playwright/test'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  TIMEOUTS,
  downloadsDir,
  UrlHelper,
  CreateAppForm,
  AppDetail,
  AppExecution,
  RunAppForm,
  AppsList,
  FilesList,
  FileDetail,
  SpacesList,
  deleteFileAndAwaitSuccess,
  waitForComputeResources,
  withDialogHandler,
} from './helpers/apps.helpers'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Unique test ID for this file (generated once, shared across all tests)
const testId = Date.now().toString(36)

/**
 * My Home - Apps Tests
 *
 * Tests for app creation, running, forking, comments, and management.
 * Uses testId (module-scoped) for unique resource names across tests.
 * 
 * Uses shared-page fixtures for faster serial test execution with SPA navigation.
 * 
 * SPA Navigation Pattern:
 * 1. Use worker-scoped fixtures for page and app (shared across all tests)
 * 2. Use app.ensureRoute() at the start of each test - it automatically:
 *    - Does a full goto() if the page hasn't been initialized yet (first test or individual run)
 *    - Uses fast SPA navigation if already initialized (serial test runs)
 * 3. Tests can run individually or in serial mode without modification
 */

async function createApp(page: Page) {
  // Set up API response listener for user compute resources
  const computeResourcesPromise = waitForComputeResources(page)

  // Click Create App button
  await page.getByTestId('home-apps-create-button').click()

  await computeResourcesPromise

  await CreateAppForm.submit(page, `cypress_app_${testId}`, `Cypress App ${testId}`)
}

// Tests must run in serial order because later tests depend on earlier ones
test.describe.configure({ mode: 'serial' })

// These tests create apps, run jobs, and wait for completion
// The job status change can take up to 20 minutes
test.setTimeout(TIMEOUTS.jobStatusChange + 60000)

// ==================== Tests ====================

test.describe('My Home - Apps', () => {
  test('Create & search empty app', async ({ page, app }) => {
    await app.ensureRoute('/home/apps')
    
    await createApp(page)
    await AppDetail.validateName(page, `cypress_app_${testId}`)
    await AppDetail.validateTitle(page, `Cypress App ${testId}`)

    // Click Back to Apps link
    await page.getByText('Back to Apps').click()

    await AppsList.searchAppAndOpenDetail(page, `cypress_app_${testId}`, `Cypress App ${testId}`)

    await AppDetail.validateBackToAppsLink(page)
    await AppDetail.validateTitle(page, `Cypress App ${testId}`)
    await AppDetail.validateName(page, `cypress_app_${testId}`)
    await AppDetail.validateLocation(page, 'Private')
    await AppDetail.validateDefaultInstanceType(page, 'Baseline 2')
    await AppDetail.validateHasInternetAccess(page, 'No')
    await AppDetail.validateEmptyTags(page)
    await AppDetail.validateEmptyProperties(page)

    const url = page.url()
    const appId = UrlHelper.getLastPathSegment(url)
    await AppDetail.validateId(page, appId)

    await AppDetail.validateUbuntuRelease(page, '24.04')
  })

  test.skip('Copy To Space', async ({ page, app }) => {
    await app.ensureRoute('/spaces')

    await SpacesList.createPrivateSpaceIfNotExists(page, 'Cypress Private Space for "copy to space" action', 'Cypress Private')

    await app.ensureRoute('/home/apps')

    await AppsList.searchAppAndOpenDetail(page, `cypress_app_${testId}`, `Cypress App ${testId}`)

    await AppDetail.clickActionsMenuItem(page, 'Copy to space')

    await page.getByText('Cypress Private Space for "copy to space" action').click()

    await page.getByRole('button', { name: 'Copy' }).click()

    await expect(page.getByText('The app has been copied to the space successfully.')).toBeVisible()

    await app.ensureRoute('/spaces')

    await SpacesList.searchSpaceOpenDetail(page, 'Cypress Private Space for "copy to space" action')

    await page.getByTestId('apps-link').click()

    const filterInput = page.getByTestId('table-filter-name').getByRole('textbox')
    await filterInput.clear()

    await AppsList.openDetail(page, `cypress_app_${testId}`, `Cypress App ${testId}`)

    await AppDetail.validateName(page, `cypress_app_${testId}`)
    await AppDetail.validateTitle(page, `Cypress App ${testId}`)
    await AppDetail.validateLocation(page, 'Cypress Private Space for "copy to space" action - Private')
  })

  test('Track', async ({ page, app }) => {
    await app.ensureRoute('/home/apps')

    await AppsList.searchAppAndOpenDetail(page, `cypress_app_${testId}`, `Cypress App ${testId}`)

    await AppDetail.clickActionsMenuItem(page, 'Track')

    await expect(page.getByText('Learn more about tracking')).toBeVisible()
  })

  test('Fork', async ({ page, app }) => {
    await app.ensureRoute('/home/apps')

    await AppsList.searchAppAndOpenDetail(page, `cypress_app_${testId}`, `Cypress App ${testId}`)

    const url = page.url()
    const originalAppId = UrlHelper.getLastPathSegment(url)

    await AppDetail.validateId(page, originalAppId)

    await AppDetail.clickActionsMenuItem(page, 'Fork to')

    await expect(page.locator('#fork-app-to-modal').getByText('Fork App To')).toBeVisible()

    await page.locator('#fork-app-to-modal td').filter({ hasText: /^My Home$/ }).click()

    // Set up API response listener for user compute resources
    const computeResourcesPromise = waitForComputeResources(page)

    await page.locator('#fork-app-to-modal button').filter({ hasText: 'Fork' }).click()

    await computeResourcesPromise

    await expect(page.locator('h1').filter({ hasText: 'Fork App' })).toBeVisible()

    await page.locator('input[name="name"]').clear()
    await page.locator('input[name="name"]').fill(`cypress_app_forked_${testId}`)

    await page.locator('input[name="title"]').clear()
    await page.locator('input[name="title"]').fill(`Cypress App Forked ${testId}`)

    const createAppPromise = page.waitForResponse(
      response => response.url().includes('/api/v2/apps') && response.request().method() === 'POST',
      { timeout: TIMEOUTS.appSave }
    )

    await page.getByRole('button', { name: 'Save Fork' }).click({ force: true })

    const response = await createAppPromise
    expect(response.status()).toBe(200)

    await expect(page.getByText('App forked successfully')).toBeVisible()

    await AppDetail.validateName(page, `cypress_app_forked_${testId}`)
    await AppDetail.validateTitle(page, `Cypress App Forked ${testId}`)
    await AppDetail.validateLocation(page, 'Private')
    await AppDetail.validateForkedFrom(page, originalAppId)
  })

  test('Export to Docker Container/CWL/WDL', async ({ page, app }) => {
    await app.ensureRoute('/home/apps')

    await AppsList.searchAppAndOpenDetail(page, `cypress_app_${testId}`, `Cypress App ${testId}`)

    await AppDetail.clickActionsMenuItem(page, 'Export to')

    // Handle dialog confirmations with automatic cleanup
    await withDialogHandler(page, async () => {
      // Click Export to Docker
      const dockerDownloadPromise = page.waitForEvent('download', { timeout: TIMEOUTS.fileDownload })
      await page.locator('div[data-testid="modal-export-to"] a').filter({ hasText: 'Export to Docker' }).click()
      const dockerDownload = await dockerDownloadPromise
      const dockerPath = path.join(downloadsDir, 'Dockerfile')
      await dockerDownload.saveAs(dockerPath)
      expect(fs.existsSync(dockerPath)).toBe(true)

      // Click CWL Tool
      const cwlDownloadPromise = page.waitForEvent('download', { timeout: TIMEOUTS.fileDownload })
      await page.locator('div[data-testid="modal-export-to"] a').filter({ hasText: 'CWL Tool' }).click()
      const cwlDownload = await cwlDownloadPromise
      const cwlPath = path.join(downloadsDir, `cypress_app_${testId}.tar.gz`)
      await cwlDownload.saveAs(cwlPath)
      expect(fs.existsSync(cwlPath)).toBe(true)

      // Click WDL Task
      const wdlDownloadPromise = page.waitForEvent('download', { timeout: TIMEOUTS.fileDownload })
      await page.locator('div[data-testid="modal-export-to"] a').filter({ hasText: 'WDL Task' }).click()
      const wdlDownload = await wdlDownloadPromise
      const wdlPath = path.join(downloadsDir, `cypress_app_${testId}_wdl.tar.gz`)
      await wdlDownload.saveAs(wdlPath)
      expect(fs.existsSync(wdlPath)).toBe(true)
    })

    await page.getByRole('button', { name: 'Cancel' }).click()

    await AppDetail.validateTitle(page, `Cypress App ${testId}`)
  })

  test('Make Public', async ({ page, app }) => {
    await app.ensureRoute('/home/apps')

    // Set up API response listener for user compute resources
    const computeResourcesPromise = waitForComputeResources(page)

    // Click Create App button
    await page.getByTestId('home-apps-create-button').click()

    await computeResourcesPromise

    await CreateAppForm.submit(page, `cypress_public_app_${testId}`, `Cypress Public App ${testId}`)

    await AppDetail.clickActionsMenuItem(page, 'Make public')

    await page.getByText('Publish selected objects').click()

    await AppDetail.validateLocation(page, 'Public')

    await page.getByTestId('everyone-button').click()

    await app.ensureRoute('/home/apps?scope=everybody')
    await AppsList.searchAppAndOpenDetail(page, `cypress_public_app_${testId}`, `Cypress Public App ${testId}`)

    await AppDetail.validateName(page, `cypress_public_app_${testId}`)
    await AppDetail.validateTitle(page, `Cypress Public App ${testId}`)
    await AppDetail.validateLocation(page, 'Public')

    await AppDetail.clickActionsMenuItem(page, 'Delete')

    await page.getByRole('button', { name: 'Delete' }).click()

    await expect(page.getByText('Deleted 1 app')).toBeVisible()
    // After delete, we're back on the apps list
  })

  test('Edit App', async ({ page, app }) => {
    await app.ensureRoute('/home/apps')

    await page.getByTestId('me-button').click()
    await AppsList.searchAppAndOpenDetail(page, `cypress_app_${testId}`, `Cypress App ${testId}`)

    await AppDetail.clickActionsMenuItem(page, 'Edit')

    // Append to the title
    const titleInput = page.locator('input[name="title"]')
    const currentTitle = await titleInput.inputValue()
    await titleInput.fill(`${currentTitle} - Edited`)

    const createAppPromise = page.waitForResponse(
      response => response.url().includes('/api/v2/apps') && response.request().method() === 'POST',
      { timeout: TIMEOUTS.appSave }
    )

    await page.getByRole('button', { name: 'Save Revision' }).click({ force: true })

    const response = await createAppPromise
    expect(response.status()).toBe(200)

    await expect(page.getByText('New revision created')).toBeVisible()

    await AppDetail.validateBackToAppsLink(page)

    await AppDetail.chooseRevision(page, 1)

    await expect(page.getByTestId('app-uid').filter({ hasText: /-1$/ })).toBeVisible()

    await AppDetail.validateTitle(page, `Cypress App ${testId}`)

    await AppDetail.chooseRevision(page, 2)

    await expect(page.getByTestId('app-uid').filter({ hasText: /-2$/ })).toBeVisible()

    await AppDetail.chooseLatestRevision(page)

    await AppDetail.validateTitle(page, `Cypress App ${testId} - Edited`)
  })

  test('Add Tags', async ({ page, app }) => {
    await app.ensureRoute('/home/apps')

    await AppsList.searchAppAndOpenDetail(page, `cypress_app_${testId}`, `Cypress App ${testId}`)

    await AppDetail.addTagsTest(page)
  })

  // TODO: remove skip when PFDA-6609 is merged
  test.skip('Add Properties', async ({ page, app }) => {
    await app.ensureRoute('/home/apps')
    await AppsList.searchAppAndOpenDetail(page, `cypress_app_${testId}`, `Cypress App ${testId}`)

    await AppDetail.addPropertiesTest(page)
  })

  // TODO: remove skip when PFDA-6609 is merged
  test.skip('Edit Properties', async ({ page, app }) => {
    await app.ensureRoute('/home/apps')
    await AppsList.searchAppAndOpenDetail(page, `cypress_app_${testId}`, `Cypress App ${testId}`)

    await AppDetail.editPropertiesTest(page)
  })

  // TODO: remove skip when PFDA-6609 is merged
  test.skip('Delete Properties', async ({ page, app }) => {
    await app.ensureRoute('/home/apps')
    await AppsList.searchAppAndOpenDetail(page, `cypress_app_${testId}`, `Cypress App ${testId}`)

    await AppDetail.deletePropertiesTest(page)
  })

  test('Copy forked app with tags into space', async ({ page, app }) => {
    await app.ensureRoute('/spaces')

    await SpacesList.createPrivateSpaceIfNotExists(page, 'Cypress Private Space for "copy to space" action', 'Cypress Private')

    await app.ensureRoute('/home/apps')

    await AppsList.searchAppAndOpenDetail(page, `cypress_app_forked_${testId}`, `Cypress App Forked ${testId}`)

    await AppDetail.addTagsTest(page)

    await AppDetail.clickActionsMenuItem(page, 'Copy to space')

    await page.getByText('Cypress Private Space for "copy to space" action').click()

    await page.getByRole('button', { name: 'Copy' }).click()

    await expect(page.getByText('The app has been copied to the space successfully.')).toBeVisible()

    await app.ensureRoute('/spaces')

    await SpacesList.searchSpaceOpenDetail(page, 'Cypress Private Space for "copy to space" action')

    await page.getByTestId('apps-link').click()

    await AppsList.searchAppAndOpenDetail(page, `cypress_app_forked_${testId}`, `Cypress App Forked ${testId}`)

    await AppDetail.validateName(page, `cypress_app_forked_${testId}`)
    await AppDetail.validateTitle(page, `Cypress App Forked ${testId}`)
    await AppDetail.validateTag(page, 'Cypress Tag')
    await AppDetail.validateTag(page, 'Cypress Second Tag')
    await AppDetail.validateLocation(page, 'Cypress Private Space for "copy to space" action - Private')
  })

  test('Delete simple app', async ({ page, app }) => {
    await app.ensureRoute('/home/apps')

    await AppsList.searchAppAndOpenDetail(page, `cypress_app_${testId}`, `Cypress App ${testId}`)

    await AppDetail.clickActionsMenuItem(page, 'Delete')

    await page.getByRole('button', { name: 'Delete' }).click()

    await expect(page.getByText('Deleted 1 app')).toBeVisible()
    // After delete, we're back on the apps list
  })

  test('Delete forked app', async ({ page, app }) => {
    await app.ensureRoute('/home/apps')

    await AppsList.searchAppAndOpenDetail(page, `cypress_app_forked_${testId}`, `Cypress App Forked ${testId}`)

    await AppDetail.clickActionsMenuItem(page, 'Delete')

    await page.getByRole('button', { name: 'Delete' }).click()

    await expect(page.getByText('Deleted 1 app')).toBeVisible()
  })
})
test.skip('My Home - Apps Run', () => {
  test('Create and Run Array Outputs App', async ({ page, app }) => {
    await app.ensureRoute('/home/apps')
    
    // Set up API response listener for user compute resources
    const computeResourcesPromise = waitForComputeResources(page)

    // Click Create App button
    await page.getByTestId('home-apps-create-button').click()

    await computeResourcesPromise

    await CreateAppForm.setAppName(page, `cypress_array_app_${testId}`)
    await CreateAppForm.setAppTitle(page, `Cypress Array App ${testId}`)

    // String Output
    await CreateAppForm.addOutput(page, 0, 'string', 'string_output_name', 'String output label', 'String output help', true, true)

    // Int Output
    await CreateAppForm.addOutput(page, 1, 'int', 'int_output_name', 'Int output label', 'Int output help', true, true)

    // Float Output
    await CreateAppForm.addOutput(page, 2, 'float', 'float_output_name', 'Float output label', 'Float output help', true, true)

    // File Output
    await CreateAppForm.addOutput(page, 3, 'file', 'file_output_name', 'File output label', 'File output help', true, true)

    await CreateAppForm.setInstanceType(page, 'Baseline 2')

    // Build the script with proper line breaks
    const scriptLines = [
      `emit string_output_name "output_string_1" "output_string_2" "output_string_3"`,
      `emit int_output_name 4 5 6`,
      `emit float_output_name 1.4 1.5 1.6`,
      `echo "cypress content" > cypress_array_app_file1_${testId}.txt`,
      `echo "cypress content" > cypress_array_app_file2_${testId}.txt`,
      `echo "cypress content" > cypress_array_app_file3_${testId}.txt`,
      `emit file_output_name cypress_array_app_file1_${testId}.txt cypress_array_app_file2_${testId}.txt cypress_array_app_file3_${testId}.txt`,
    ]

    // Click Script tab
    await page.getByText('Write your shell script').click()

    // Wait for Monaco editor to load
    const editor = page.getByTestId('script-editor').locator('.monaco-editor')
    await expect(editor).toBeVisible({ timeout: 90000 })
    await page.waitForTimeout(500)

    // Click into the editor
    await editor.click()

    // Type script line by line
    for (let i = 0; i < scriptLines.length; i++) {
      await page.keyboard.type(scriptLines[i], { delay: 0 })
      if (i < scriptLines.length - 1) {
        await page.keyboard.press('Enter')
      }
    }

    await CreateAppForm.send(page)

    // Set up listener for compute resources on run form
    const computeResourcesRunFormPromise = waitForComputeResources(page)

    // Click Run App button
    await page.getByRole('button', { name: 'Run App' }).click({ force: true })

    await computeResourcesRunFormPromise

    await RunAppForm.setOutputFolder(page, `cypress_array_app_output_files_${testId}`)

    await RunAppForm.submit(page)

    await AppExecution.validateAppTitle(page, `Cypress Array App ${testId}`)
    await AppExecution.validateInstanceType(page, 'Baseline 2')
    await AppExecution.validateLocation(page, 'Private')

    // Wait for job to finish (toast notification)
    await expect(page.getByText(`Job cypress_array_app_${testId} has finished`)).toBeVisible({
      timeout: TIMEOUTS.jobStatusChange,
    })

    await AppExecution.validateOutput(page, 'String output label')
    await AppExecution.validateOutput(page, 'output_string_1,output_string_2,output_string_3')

    await AppExecution.validateOutput(page, 'Int output label')
    await AppExecution.validateOutput(page, '4,5,6')

    await AppExecution.validateOutput(page, 'Float output label')
    await AppExecution.validateOutput(page, '1.4,1.5,1.6')

    await AppExecution.validateOutput(page, 'File output label')
    await AppExecution.validateOutput(page, `cypress_array_app_file1_${testId}.txt`)
    await AppExecution.validateOutput(page, `cypress_array_app_file2_${testId}.txt`)
    await AppExecution.validateOutput(page, `cypress_array_app_file3_${testId}.txt`)

    await app.ensureRoute('/home/apps')

    await AppsList.searchAppAndOpenDetail(page, `cypress_array_app_${testId}`, `Cypress Array App ${testId}`)

    await AppDetail.clickActionsMenuItem(page, 'Delete')

    await page.getByRole('button', { name: 'Delete' }).click()

    await expect(page.getByText('Deleted 1 app')).toBeVisible()

    await app.ensureRoute('/home/files')

    await FilesList.searchFile(page, `cypress_array_app_output_files_${testId}`)

    await expect(
      page.getByTestId('table-col-name').filter({ hasText: `cypress_array_app_output_files_${testId}` })
    ).toBeVisible()

    await page.locator('input[type="checkbox"]').last().check({ force: true })

    await page.getByTestId('home-files-actions-button').click({ force: true })

    await page.getByText('Delete').click({ force: true })

    await deleteFileAndAwaitSuccess(page)
    // After deleting files, we're on /home/files
  })

  test('Delete File Output App', async ({ page, app }) => {
    await app.ensureRoute('/home/apps')

    await AppsList.searchAppAndOpenDetail(page, `cypress_file_output_app_${testId}`, `Cypress File Output App ${testId}`)

    await AppDetail.clickActionsMenuItem(page, 'Delete')

    await page.getByRole('button', { name: 'Delete' }).click()

    await expect(page.getByText('Deleted 1 app')).toBeVisible()
  })
})
test.skip('My Home - Apps run using pre-filled run job form url', () => {
  test('Run empty app using pre-filled run job form url', async ({ page, app }) => {
    await app.ensureRoute('/home/apps')
    
    await createApp(page)
    await page.getByTestId('home-apps-link').click();
    await AppsList.searchAppAndOpenDetail(page, `cypress_app_${testId}`, `Cypress App ${testId}`)

    // Set up API response listener for user compute resources
    const computeResourcesPromise = waitForComputeResources(page)

    await page.getByText('Run App').click()

    await computeResourcesPromise

    await page.getByRole('button', { name: 'Export Values' }).click()

    await page.waitForTimeout(5000)

    // Click Copy link for Current App button
    await page.getByRole('button', { name: 'Copy link for Current App' }).click({ force: true })

    await expect(page.getByText('The link has been copied into your clipboard')).toBeVisible()

    // Read clipboard content
    const clipboardText = await page.evaluate(async () => {
      return await navigator.clipboard.readText()
    })

    await app.ensureRoute('/')

    await page.waitForTimeout(5000)

    // Re-visit run job form page using pre-filled url
    await app.ensureRoute(clipboardText)

    // Set up API response listener for user compute resources
    const computeResourcesPromise2 = waitForComputeResources(page)

    await page.getByRole('button', { name: 'Run App' }).click({ force: true })

    await computeResourcesPromise2

    await RunAppForm.submit(page)

    await AppExecution.validateAppTitle(page, `Cypress App ${testId}`)
    await AppExecution.validateInstanceType(page, 'Baseline 2')
    await AppExecution.validateLocation(page, 'Private')
  })
})
test.skip('My Home - Run file to output app with output to folder', () => {
  test('Run file to output app with output to folder', async ({ page, app }) => {
    await app.ensureRoute('/home/apps')
    
    // Set up API response listener for user compute resources
    const computeResourcesPromise = waitForComputeResources(page)

    // Click Create App button
    await page.getByTestId('home-apps-create-button').click()

    await computeResourcesPromise

    await CreateAppForm.setAppName(page, `cypress_file_output_app_${testId}`)
    await CreateAppForm.setAppTitle(page, `Cypress File Output App ${testId}`)
    await CreateAppForm.setInstanceType(page, 'baseline 2')
    await CreateAppForm.addOutput(page, 0, 'file', 'cypress_output_file', 'cypress_output_label', 'cypress_output_help', false, false)

    // Click Script tab
    await page.getByText('Write your shell script').click()

    // Wait for Monaco editor
    const editor = page.getByTestId('script-editor').locator('.monaco-editor')
    await expect(editor).toBeVisible({ timeout: 90000 })
    await page.waitForTimeout(500)
    await editor.click()

    await page.keyboard.type(`echo "cypress content" > cypress_output_file_${testId}.txt`, { delay: 0 })
    await page.keyboard.press('Enter')
    await page.keyboard.type(`emit cypress_output_file cypress_output_file_${testId}.txt`, { delay: 0 })

    await CreateAppForm.send(page)

    // Set up listener for compute resources on run form
    const computeResourcesRunFormPromise = waitForComputeResources(page)

    await expect(page.getByRole('button', { name: 'Run App' })).toBeVisible()
    await page.getByRole('button', { name: 'Run App' }).click({ force: true })

    await computeResourcesRunFormPromise

    await RunAppForm.prepare(page)
    await RunAppForm.setJobName(page, `cypress_file_output_app_${testId} output_to_folder`)
    await RunAppForm.setOutputFolder(page, `cypress_output_folder_${testId}`)
    await RunAppForm.send(page)

    // Wait for job to finish (toast notification)
    await expect(
      page.getByText(`Job cypress_file_output_app_${testId} output_to_folder has finished`)
    ).toBeVisible({ timeout: TIMEOUTS.jobStatusChange })

    // Click on output file
    await page.getByTestId('execution-outputs').getByText(`cypress_output_file_${testId}.txt`).click()

    await FileDetail.validateOrigin(page, `cypress_file_output_app_${testId} output_to_folder`)

    await expect(page.getByTestId('file-size')).not.toBeEmpty()

    await app.ensureRoute(`/home/files?scope=me&name=cypress_output_folder_${testId}`)

    await page.getByTestId('table-col-name').filter({ hasText: `cypress_output_folder_${testId}` }).click()

    await expect(
      page.getByTestId('table-col-name').filter({ hasText: `cypress_output_file_${testId}.txt` })
    ).toBeVisible({ timeout: TIMEOUTS.pageLoad })

    await app.ensureRoute('/home/files')

    await FilesList.searchFile(page, `cypress_output_folder_${testId}`)

    await expect(
      page.getByTestId('table-col-name').filter({ hasText: `cypress_output_folder_${testId}` })
    ).toBeVisible()

    await page.locator('input[type="checkbox"]').last().check({ force: true })

    await page.getByTestId('home-files-actions-button').click({ force: true })

    await page.getByText('Delete').click({ force: true })

    await deleteFileAndAwaitSuccess(page)
  })
})
