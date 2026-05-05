import { test, expect } from './extend'
import {
  AUTH_FILES,
  acceptLicenseForFile,
  attachLicenseToFile,
  clickCreateLicense,
  createPageWithAuth,
  currentLicensePath,
  deleteCurrentLicense,
  detachLicenseFromFile,
  expectFilePendingApproval,
  expectFileRequiresAcceptance,
  expectLicensePreview,
  fillLicenseForm,
  gotoLicensesIndex,
  makeFilePublic,
  openFileFromDetail,
  openPublicFileDetail,
  requestApprovalForFile,
  saveLicense,
  uploadFilesToMyHome,
} from './helpers/licenses.helpers'
import { FilesList, TIMEOUTS } from './helpers/files.helpers'

const testId = Date.now().toString(36)

const tempLicenseTitle = `E2E Temp License ${testId}`
const tempLicenseEditedTitle = `E2E Temp License Edited ${testId}`
const autoLicenseTitle = `E2E Auto License ${testId}`
const manualLicenseTitle = `E2E Manual License ${testId}`

const tempLicenseContent = `# Temp License ${testId}\n\nTemporary content for CRUD coverage.`
const tempLicenseEditedContent = `# Temp License Edited ${testId}\n\nUpdated markdown content.`
const autoLicenseContent = `# Auto License ${testId}\n\nShared license used across two files.`
const manualLicenseContent = `# Manual License ${testId}\n\nRequires owner approval before access.`

const sharedFileName = `license-shared-${testId}.txt`
const sharedSecondFileName = `license-shared-second-${testId}.txt`
const manualFileName = `license-manual-${testId}.txt`
const approvalMessage = `Need access for license e2e ${testId}`

let autoLicensePath = ''
let manualLicensePath = ''
let sharedFileUid = ''
let sharedSecondFileUid = ''
let manualFileUid = ''

test.describe.configure({ mode: 'serial' })

test.describe('Licenses', () => {
  test('license CRUD, selector-backed flows and file setup', async ({ page }) => {
    await clickCreateLicense(page)
    await fillLicenseForm(page, {
      title: tempLicenseTitle,
      content: tempLicenseContent,
      approvalRequired: false,
    })
    await expectLicensePreview(page, `Temp License ${testId}`)
    await saveLicense(page)

    await expect(page.getByTestId('license-header-title')).toHaveText(tempLicenseTitle)
    await expect(page.getByTestId('license-rendered-content')).toContainText('Temporary content for CRUD coverage.')
    await expect(page.getByTestId('license-approval-type')).toHaveText('Automatic')

    await page.getByTestId('license-edit-button').click()
    await expect(page.getByTestId('license-edit-form')).toBeVisible()
    await fillLicenseForm(page, {
      title: tempLicenseEditedTitle,
      content: tempLicenseEditedContent,
      approvalRequired: true,
    })
    await expectLicensePreview(page, `Temp License Edited ${testId}`)
    await saveLicense(page)

    await expect(page.getByTestId('license-header-title')).toHaveText(tempLicenseEditedTitle)
    await expect(page.getByTestId('license-rendered-content')).toContainText('Updated markdown content.')
    await expect(page.getByTestId('license-approval-type')).toHaveText('Manual')

    await deleteCurrentLicense(page)
    await expect(
      page.getByTestId('licenses-grid').getByRole('link', { name: tempLicenseEditedTitle, exact: true }),
    ).not.toBeVisible()

    await clickCreateLicense(page)
    await fillLicenseForm(page, {
      title: autoLicenseTitle,
      content: autoLicenseContent,
      approvalRequired: false,
    })
    await expectLicensePreview(page, `Auto License ${testId}`)
    await saveLicense(page)
    autoLicensePath = currentLicensePath(page)

    await clickCreateLicense(page)
    await fillLicenseForm(page, {
      title: manualLicenseTitle,
      content: manualLicenseContent,
      approvalRequired: true,
    })
    await expectLicensePreview(page, `Manual License ${testId}`)
    await saveLicense(page)
    manualLicensePath = currentLicensePath(page)

    const uploadedFileUids = await uploadFilesToMyHome(page, [sharedFileName, sharedSecondFileName, manualFileName])
    sharedFileUid = uploadedFileUids[sharedFileName]
    sharedSecondFileUid = uploadedFileUids[sharedSecondFileName]
    manualFileUid = uploadedFileUids[manualFileName]

    sharedFileUid = await makeFilePublic(page, sharedFileName, sharedFileUid)
    sharedSecondFileUid = await makeFilePublic(page, sharedSecondFileName, sharedSecondFileUid)
    manualFileUid = await makeFilePublic(page, manualFileName, manualFileUid)
  })

  test('attach, detach, and reattach licenses to files', async ({ page }) => {
    await attachLicenseToFile(page, sharedFileName, autoLicenseTitle, 'everybody', sharedFileUid)
    await detachLicenseFromFile(page, sharedFileName, 'everybody', sharedFileUid)
    await attachLicenseToFile(page, sharedFileName, autoLicenseTitle, 'everybody', sharedFileUid)
    await attachLicenseToFile(page, sharedSecondFileName, autoLicenseTitle, 'everybody', sharedSecondFileUid)
    await attachLicenseToFile(page, manualFileName, manualLicenseTitle, 'everybody', manualFileUid)
  })

  test('secondary user accepts shared license once and gains access to both files', async ({ browser }) => {
    const { context, page } = await createPageWithAuth(browser, AUTH_FILES.secondary)

    try {
      await expectFileRequiresAcceptance(page, sharedFileName, sharedFileUid)
      await acceptLicenseForFile(page, sharedFileName, autoLicenseTitle, sharedFileUid)

      const openedSharedFile = await openFileFromDetail(page)
      await expect(openedSharedFile.locator('pre').filter({ hasText: /^Hello World$/ })).toBeVisible({
        timeout: TIMEOUTS.pageLoad,
      })
      await openedSharedFile.close()

      await openPublicFileDetail(page, sharedSecondFileName, sharedSecondFileUid)
      await expect(page.getByTestId('file-open-button')).toBeEnabled()
      await page.getByTestId('file-show-actions-button').click()
      await expect(page.getByTestId('action-menu-item-accept-license')).toHaveCount(0)

      const openedSecondFile = await openFileFromDetail(page)
      await expect(openedSecondFile.locator('pre').filter({ hasText: /^Hello World$/ })).toBeVisible({
        timeout: TIMEOUTS.pageLoad,
      })
      await openedSecondFile.close()
    } finally {
      await context.close()
    }
  })

  test('secondary requests manual approval and primary bulk-approves it', async ({ page, browser }) => {
    const secondarySession = await createPageWithAuth(browser, AUTH_FILES.secondary)

    try {
      await openPublicFileDetail(secondarySession.page, manualFileName, manualFileUid)
      await expect(secondarySession.page.getByTestId('file-open-button')).toBeDisabled()
      await secondarySession.page.getByTestId('file-show-actions-button').click()
      await expect(secondarySession.page.getByTestId('action-menu-item-request-license-approval')).toBeVisible()

      await requestApprovalForFile(secondarySession.page, manualFileName, approvalMessage, manualFileUid)
      await expectFilePendingApproval(secondarySession.page, manualFileName, manualFileUid)
    } finally {
      await secondarySession.context.close()
    }

    await page.goto(manualLicensePath)
    await page.getByTestId('license-users-tab').click()
    await expect(page.getByTestId('license-users-list')).toBeVisible()
    await expect(page.getByTestId('license-user-row')).toHaveCount(1)
    await expect(page.getByTestId('license-user-message')).toContainText(approvalMessage)

    page.once('dialog', dialog => dialog.accept())
    await page.getByTestId('license-approve-all-button').click()
    await expect(page.getByTestId('license-user-approved-state')).toBeVisible({ timeout: TIMEOUTS.pageLoad })

    const approvedSecondarySession = await createPageWithAuth(browser, AUTH_FILES.secondary)

    try {
      await openPublicFileDetail(approvedSecondarySession.page, manualFileName, manualFileUid)
      await expect(approvedSecondarySession.page.getByTestId('file-open-button')).toBeEnabled()

      const openedManualFile = await openFileFromDetail(approvedSecondarySession.page)
      await expect(openedManualFile.locator('pre').filter({ hasText: /^Hello World$/ })).toBeVisible({
        timeout: TIMEOUTS.pageLoad,
      })
      await openedManualFile.close()
    } finally {
      await approvedSecondarySession.context.close()
    }
  })

  test('primary revoke and reset flows re-block access for secondary', async ({ page, browser }) => {

    await page.goto(autoLicensePath)
    await page.getByTestId('license-users-tab').click()
    await expect(page.getByTestId('license-user-row')).toHaveCount(1)
    await page.getByTestId('license-revoke-user-button').click()
    await expect(page.getByText('No one has accepted this license yet')).toBeVisible({ timeout: TIMEOUTS.pageLoad })

    const autoRevokedSession = await createPageWithAuth(browser, AUTH_FILES.secondary)
    try {
      await expectFileRequiresAcceptance(autoRevokedSession.page, sharedFileName, sharedFileUid)
    } finally {
      await autoRevokedSession.context.close()
    }

    const reacceptedSession = await createPageWithAuth(browser, AUTH_FILES.secondary)
    try {
      await acceptLicenseForFile(reacceptedSession.page, sharedFileName, autoLicenseTitle, sharedFileUid)
    } finally {
      await reacceptedSession.context.close()
    }

    await page.goto(manualLicensePath)
    await page.getByTestId('license-users-tab').click()
    page.once('dialog', dialog => dialog.accept())
    await page.getByTestId('license-revoke-all-button').click()
    await expect(page.getByText('No one has accepted this license yet')).toBeVisible({ timeout: TIMEOUTS.pageLoad })

    const manualResetSession = await createPageWithAuth(browser, AUTH_FILES.secondary)
    try {
      await openPublicFileDetail(manualResetSession.page, manualFileName, manualFileUid)
      await expect(manualResetSession.page.getByTestId('file-open-button')).toBeDisabled()
      await manualResetSession.page.getByTestId('file-show-actions-button').click()
      await expect(manualResetSession.page.getByTestId('action-menu-item-request-license-approval')).toBeVisible()
    } finally {
      await manualResetSession.context.close()
    }
  })

  test('cleanup uploaded files', async ({ page }) => {

    for (const fileName of [sharedFileName, sharedSecondFileName, manualFileName]) {
      await page.goto('/home/files?scope=everybody')
      await FilesList.searchFileAndOpenDetail(page, fileName)
      await page.getByTestId('file-show-actions-button').click()
      await page.getByTestId('action-menu-item-delete').click()
      await page.getByRole('button', { name: 'Delete' }).click()
      await expect(page.getByText('Successfully deleted')).toBeVisible({ timeout: 90000 })
    }

    await gotoLicensesIndex(page)
  })
})
