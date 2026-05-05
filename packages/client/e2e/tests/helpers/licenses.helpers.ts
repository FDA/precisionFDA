import { expect } from 'playwright/test'
import type { Browser, BrowserContext, Page } from 'playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FileDetail, FilesList, TIMEOUTS, createTestFile } from './files.helpers'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const AUTH_FILES = {
  primary: path.join(__dirname, '../../.auth/primary.json'),
  secondary: path.join(__dirname, '../../.auth/secondary.json'),
}

export async function createPageWithAuth(browser: Browser, authFile: string): Promise<{
  context: BrowserContext
  page: Page
}> {
  const context = await browser.newContext({
    storageState: authFile,
    ignoreHTTPSErrors: true,
  })
  const page = await context.newPage()
  return { context, page }
}

export async function gotoLicensesIndex(page: Page) {
  await page.goto('/licenses')
  await expect(page.getByTestId('licenses-index-toolbar')).toBeVisible()
}

export async function clickCreateLicense(page: Page) {
  await gotoLicensesIndex(page)
  await page.getByTestId('license-create-button').click()
  await expect(page.getByTestId('license-edit-form')).toBeVisible({ timeout: TIMEOUTS.pageLoad })
}

export async function setLicenseEditorContent(page: Page, content: string) {
  await expect(page.getByTestId('license-edit-form')).toBeVisible()
  await page.getByTestId('license-editor-tab').click()
  await page.waitForFunction(() => {
    const win = window as Window & {
      ko?: { dataFor?: (node: Element | null) => { content?: (value?: string) => unknown } | undefined }
    }
    const root = document.querySelector('body main')
    const model = win.ko?.dataFor?.(root)
    return typeof model?.content === 'function'
  })
  await page.evaluate((nextContent) => {
    const win = window as Window & {
      ace?: { edit: (id: string) => { setValue: (value: string, cursorPos: number) => void; clearSelection: () => void } }
      ko?: { dataFor?: (node: Element | null) => { content?: (value?: string) => unknown } | undefined }
    }
    const root = document.querySelector('body main')
    const model = win.ko?.dataFor?.(root)

    if (typeof model?.content !== 'function') {
      throw new Error('License knockout model is not available on the edit page')
    }

    model.content(nextContent)

    const hiddenInput = document.querySelector('input[name="license[content]"]') as HTMLInputElement | null
    if (hiddenInput) {
      hiddenInput.value = nextContent
      hiddenInput.dispatchEvent(new Event('input', { bubbles: true }))
      hiddenInput.dispatchEvent(new Event('change', { bubbles: true }))
    }

    const editorElement = document.getElementById('license-editor')
    if (editorElement && win.ace) {
      const editor = win.ace.edit('license-editor')
      editor.setValue(nextContent, -1)
      editor.clearSelection()
    }
  }, content)
}

export async function fillLicenseForm(page: Page, options: {
  title: string
  content: string
  approvalRequired: boolean
}) {
  await page.getByTestId('license-title-input').fill(options.title)
  await setLicenseEditorContent(page, options.content)

  const checkbox = page.getByTestId('license-approval-required-checkbox')
  if (options.approvalRequired) {
    await checkbox.check()
  } else {
    await checkbox.uncheck()
  }
}

export async function expectLicensePreview(page: Page, previewText: string) {
  await page.getByTestId('license-preview-tab').click()
  await expect(page.getByTestId('license-preview-content')).toContainText(previewText)
  await page.getByTestId('license-editor-tab').click()
}

export async function saveLicense(page: Page) {
  await Promise.all([
    page.waitForURL(/\/licenses\/[^/]+$/),
    page.getByTestId('license-save-button').click(),
  ])
  await expect(page.getByTestId('license-header')).toBeVisible({ timeout: TIMEOUTS.pageLoad })
}

export function currentLicensePath(page: Page): string {
  return new URL(page.url()).pathname
}

export async function currentFileUid(page: Page): Promise<string> {
  const uid = (await page.getByTestId('file-uid').textContent())?.trim()

  if (!uid) {
    throw new Error('Current file UID was not found on the detail page')
  }

  return uid
}

async function currentListedFileUid(page: Page, fileName: string): Promise<string> {
  await FilesList.waitForFileToBeClosed(page, fileName)
  await FilesList.openDetail(page, fileName)
  return await currentFileUid(page)
}

export async function openPrivateFileDetail(page: Page, fileName: string, fileUid?: string) {
  if (fileUid) {
    await page.goto(`/home/files/${fileUid}`)
    await FileDetail.validateName(page, fileName)
    return
  }

  await FilesList.waitForFileToBeClosed(page, fileName)
  await FilesList.openDetail(page, fileName)
}

export async function deleteCurrentLicense(page: Page) {
  const actionsButton = page.getByTestId('license-actions-button')
  await expect(actionsButton).toBeVisible()

  await actionsButton.click({ force: true })
  const menu = page.getByTestId('license-actions-menu')

  const menuOpened = await menu.isVisible().catch(() => false)
  if (!menuOpened) {
    await page.evaluate(() => {
      const button = document.querySelector('[data-testid="license-actions-button"]') as HTMLButtonElement | null
      if (!button) {
        throw new Error('License actions button was not found')
      }

      button.click()

      const jquery = (window as Window & { $?: (element: Element) => { dropdown: (action: string) => void } }).$
      if (jquery) {
        jquery(button).dropdown('toggle')
      }
    })
  }

  page.once('dialog', dialog => dialog.accept())
  const visibleMenu = await menu.isVisible().catch(() => false)
  if (visibleMenu) {
    await page.locator('[data-testid="license-delete-button"]:visible').click()
  } else {
    await page.evaluate(() => {
      const deleteLink = document.querySelector('[data-testid="license-delete-button"]') as HTMLAnchorElement | null
      if (!deleteLink) {
        throw new Error('License delete link was not found')
      }
      deleteLink.click()
    })
  }
  await page.waitForURL(/\/licenses$/)
  await expect(page.getByTestId('licenses-grid')).toBeVisible()
}

export async function uploadFilesToMyHome(page: Page, fileNames: string[]) {
  const filePaths = await Promise.all(fileNames.map(fileName => createTestFile(fileName)))
  const fileUids: Record<string, string> = {}

  await page.goto('/home/files')
  await page.getByTestId('home-files-add-files-button').click()
  await expect(page.getByTestId('modal-files-upload')).toBeVisible()
  await page.getByTestId('upload-modal-file-input').setInputFiles(filePaths)
  await page.getByTestId('upload-modal-upload').click()
  await expect(page.getByTestId('upload-modal-close')).toBeVisible({ timeout: 120000 })
  await page.getByTestId('upload-modal-close').click()

  for (const fileName of fileNames) {
    await page.goto('/home/files')
    fileUids[fileName] = await currentListedFileUid(page, fileName)
  }

  return fileUids
}

export async function makeFilePublic(page: Page, fileName: string, fileUid?: string) {
  await openPrivateFileDetail(page, fileName, fileUid)
  await clickFileAction(page, 'action-menu-item-make-public', 'Make public')
  await page.getByText('Publish selected objects').click()
  await page.waitForLoadState('networkidle')
  await FileDetail.validateLocation(page, 'Public')
  return await currentFileUid(page)
}

export async function openPublicFileDetail(page: Page, fileName: string, fileUid?: string) {
  if (fileUid) {
    await page.goto(`/home/files/${fileUid}?scope=everybody`)
  } else {
    await page.goto('/home/files?scope=everybody')
    await FilesList.waitForFileToBeClosed(page, fileName)
    await FilesList.openDetail(page, fileName)
  }
  await FileDetail.validateName(page, fileName)
  await FileDetail.validateLocation(page, 'Public')
}

export async function clickFileAction(page: Page, actionTestId: string, actionLabel?: string) {
  await page.getByTestId('file-show-actions-button').click()
  const testIdLocator = page.getByTestId(actionTestId)
  const hasStableTestId = await testIdLocator.count()

  if (hasStableTestId > 0) {
    await expect(testIdLocator).toBeVisible()
    await testIdLocator.click()
    return
  }

  if (!actionLabel) {
    throw new Error(`Action ${actionTestId} was not found and no fallback label was provided`)
  }

  const actionByRole = page.getByRole('menuitem', { name: actionLabel, exact: true })
  await expect(actionByRole).toBeVisible()
  await actionByRole.click()
}

export async function attachLicenseToFile(
  page: Page,
  fileName: string,
  licenseTitle: string,
  scope: 'me' | 'everybody' = 'me',
  fileUid?: string,
) {
  if (scope === 'everybody') {
    await openPublicFileDetail(page, fileName, fileUid)
  } else {
    await openPrivateFileDetail(page, fileName, fileUid)
  }
  await clickFileAction(page, 'action-menu-item-attach-license', 'Attach License')
  const modal = page.getByTestId('modal-licenses-attach')
  await expect(modal).toBeVisible()
  await modal.getByText(licenseTitle, { exact: true }).click()

  const attachButton = modal.getByRole('button', { name: 'Attach', exact: true })
  await expect(attachButton).toBeEnabled()

  const attachResponse = page.waitForResponse(
    response => response.url().includes('/api/licenses/') && response.url().includes('/license_item/') && response.request().method() === 'POST',
    { timeout: TIMEOUTS.pageLoad },
  )
  await attachButton.click()
  await attachResponse
  await expect(page.getByText('Success: Attaching Licenses')).toBeVisible({ timeout: TIMEOUTS.pageLoad })
}

export async function detachLicenseFromFile(
  page: Page,
  fileName: string,
  scope: 'me' | 'everybody' = 'me',
  fileUid?: string,
) {
  if (scope === 'everybody') {
    await openPublicFileDetail(page, fileName, fileUid)
  } else {
    await openPrivateFileDetail(page, fileName, fileUid)
  }
  await clickFileAction(page, 'action-menu-item-detach-license', 'Detach License')
  const modal = page.getByTestId('modal-detach-license-confirmation')
  await expect(modal).toBeVisible()

  const detachButton = modal.getByRole('button', { name: 'Detach', exact: true })
  await expect(detachButton).toBeEnabled()

  const detachResponse = page.waitForResponse(
    response => response.url().includes('/api/licenses/') && response.url().includes('/remove_item/') && response.request().method() === 'POST',
    { timeout: TIMEOUTS.pageLoad },
  )
  await detachButton.click()
  await detachResponse
  await expect(page.getByText('Success: Detaching license.')).toBeVisible({ timeout: TIMEOUTS.pageLoad })
}

export async function acceptLicenseForFile(page: Page, fileName: string, expectedLicenseTitle: string, fileUid?: string) {
  await openPublicFileDetail(page, fileName, fileUid)
  await clickFileAction(page, 'action-menu-item-accept-license', 'Accept License')
  await expect(page.getByTestId('modal-accept-licenses')).toBeVisible()
  await expect(page.getByTestId('accept-license-name')).toHaveText(expectedLicenseTitle)

  const acceptResponse = page.waitForResponse(
    response => response.url().includes('/api/v2/licenses/') && response.request().method() === 'PATCH',
    { timeout: TIMEOUTS.pageLoad },
  )
  await page.getByTestId('accept-license-submit').click()
  await acceptResponse
  await expect(page.getByText('Success: Accept License')).toBeVisible({ timeout: TIMEOUTS.pageLoad })
}

export async function requestApprovalForFile(page: Page, fileName: string, message: string, fileUid?: string) {
  await openPublicFileDetail(page, fileName, fileUid)
  await clickFileAction(page, 'action-menu-item-request-license-approval', 'Request license approval')
  await expect(page.getByTestId('license-request-approval-form')).toBeVisible()
  await page.getByTestId('license-request-message').fill(message)
  await page.getByTestId('license-request-submit').click()
  await expect(page.getByText('License approval requested')).toBeVisible({ timeout: TIMEOUTS.pageLoad })
}

export async function expectFileRequiresAcceptance(page: Page, fileName: string, fileUid?: string) {
  await openPublicFileDetail(page, fileName, fileUid)
  await expect(page.getByTestId('file-open-button')).toBeDisabled()
  await page.getByTestId('file-show-actions-button').click()
  await expect(page.getByTestId('action-menu-item-accept-license')).toBeVisible()
}

export async function expectFilePendingApproval(page: Page, fileName: string, fileUid?: string) {
  await openPublicFileDetail(page, fileName, fileUid)
  await expect(page.getByTestId('file-open-button')).toBeDisabled()
  await expect(page.getByTestId('file-license-pending')).toBeVisible()
}

export async function openFileFromDetail(page: Page) {
  const [newPage] = await Promise.all([
    page.context().waitForEvent('page'),
    page.getByTestId('file-open-button').click(),
  ])
  await newPage.waitForLoadState('networkidle')
  return newPage
}
