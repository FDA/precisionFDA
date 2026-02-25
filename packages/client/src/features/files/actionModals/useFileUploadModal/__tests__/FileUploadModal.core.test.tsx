/**
 * FileUploadModal Core Tests
 *
 * This test suite covers core functionality of the file upload modal:
 * - Modal opening/closing behavior
 * - Upload location display
 * - File selection and dropzone
 * - File upload table display
 * - Maximum files limit
 *
 * Test utilities are located in ../_test-helpers.tsx
 */

import { describe, expect, test } from 'vitest'
import {
  createTestFile,
  FileUploadTrigger,
  openUploadModal,
  setupBasicUploadScenario,
  uploadFilesToModal,
} from '../_test-helpers'
import { render } from '@/test/test-utils'

describe('FileUploadModal - Core Functionality', () => {
  describe('Modal Opening', () => {
    test('Should open the upload modal when triggered', async () => {
      const screen = render(<FileUploadTrigger />)

      await openUploadModal(screen)

      await expect.element(screen.getByTestId('modal-files-upload')).toBeVisible()
    })
  })

  describe('Upload Location Display', () => {
    test('Should display "My Home" when no folder or space is specified', async () => {
      const screen = render(<FileUploadTrigger />)

      await openUploadModal(screen)

      await expect.element(screen.getByText(/Upload Files to/i)).toBeVisible()
      await expect.element(screen.getByText('My Home')).toBeVisible()
    })

    test('Should display folder path when folderId is provided', async () => {
      const folderPath = [
        { id: 1, name: 'Documents' },
        { id: 2, name: 'Projects' },
      ]

      const screen = render(<FileUploadTrigger folderId="2" folderPath={folderPath} />)

      await openUploadModal(screen)

      await expect.element(screen.getByText('Documents')).toBeVisible()
      await expect.element(screen.getByText('Projects')).toBeVisible()
    })
  })

  describe('Dropzone and File Selection', () => {
    test('Should display dropzone area', async () => {
      const screen = render(<FileUploadTrigger />)

      await openUploadModal(screen)

      await expect.element(screen.getByText(/Drag & drop files here/i)).toBeVisible()
      await expect.element(screen.getByTestId('upload-modal-select-files-btn')).toBeVisible()
      await expect.element(screen.getByTestId('upload-modal-select-folders-btn')).toBeVisible()
      await expect.element(screen.getByText(/You can upload up to 200 files at a time/i)).toBeVisible()
    })

    test('Should show file count when files are selected', async () => {
      const screen = render(<FileUploadTrigger />)

      await openUploadModal(screen)

      await expect.element(screen.getByText('0 Files Ready to Upload')).toBeVisible()
    })

    test('Should add files to the upload list when dropped', async () => {
      const screen = render(<FileUploadTrigger />)

      await openUploadModal(screen)

      await expect.element(screen.getByTestId('modal-files-upload')).toBeVisible()

      const file1 = createTestFile('test-file-1.txt', 'content1')
      const file2 = createTestFile('test-file-2.txt', 'content2')

      await uploadFilesToModal([file1, file2])

      await expect.element(screen.getByText('2 Files Ready to Upload')).toBeVisible()
      await expect.element(screen.getByText('test-file-1.txt')).toBeVisible()
      await expect.element(screen.getByText('test-file-2.txt')).toBeVisible()
    })
  })

  describe('File Upload Actions', () => {
    test('Should enable Upload button when files are added', async () => {
      const { screen } = await setupBasicUploadScenario()

      const uploadButton = screen.getByTestId('upload-modal-upload')
      await expect.element(uploadButton).toBeEnabled()
    })

    test('Should enable Remove all button when files are added', async () => {
      const { screen } = await setupBasicUploadScenario()

      const removeAllButton = screen.getByRole('button', { name: /Remove all/i })
      await expect.element(removeAllButton).toBeEnabled()
    })
  })

  describe('File Upload Table', () => {
    test('Should show Ready to upload status for newly added files', async () => {
      const { screen } = await setupBasicUploadScenario()

      await expect.element(screen.getByText('Ready to upload')).toBeVisible()
    })

    test('Should remove file when remove button is clicked', async () => {
      const screen = render(<FileUploadTrigger />)

      await openUploadModal(screen)

      const file1 = createTestFile('file1.txt', 'content1')
      const file2 = createTestFile('file2.txt', 'content2')

      await uploadFilesToModal([file1, file2])

      await expect.element(screen.getByText('2 Files Ready to Upload')).toBeVisible()

      const removeButton = screen.getByTitle(/Remove file/i).first()
      await removeButton.click()

      await expect.element(screen.getByText('1 File Ready to Upload')).toBeVisible()
      // File2 should still be visible
      await expect.element(screen.getByText('file2.txt')).toBeVisible()
    })
  })

  describe('Maximum Files Limit', () => {
    test('Should show error when exceeding maximum file limit', async () => {
      const screen = render(<FileUploadTrigger />)

      await openUploadModal(screen)

      // Create 201 files (exceeding MAX_UPLOADABLE_FILES = 200)
      const files = Array.from({ length: 201 }, (_, i) => createTestFile(`file${i}.txt`, `content${i}`))

      await uploadFilesToModal(files)

      // Should show error message about file limit
      await expect.element(screen.getByText(/You can only upload up to 200 files at a time/i)).toBeVisible()
    })
  })
})
