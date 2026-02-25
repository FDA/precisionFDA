/**
 * FileUploadActions Tests
 *
 * This test suite covers file upload action functionality:
 * - File actions menu interactions
 * - Remove action
 * - Multiple file actions
 *
 * Test utilities are located in ../_test-helpers.tsx
 */

import { describe, expect, test } from 'vitest'
import {
  createTestFile,
  FileUploadTrigger,
  getRemoveMenuItem,
  openActionsMenu,
  openUploadModal,
  setupBasicUploadScenario,
  uploadFilesToModal,
} from '../_test-helpers'
import { render } from '@/test/test-utils'

describe('FileUploadActions', () => {
  describe('Remove Action', () => {
    test('Should show Remove option in actions menu', async () => {
      const { screen } = await setupBasicUploadScenario()

      await expect.element(screen.getByText('test.txt')).toBeVisible()

      await openActionsMenu(screen)

      await expect.element(getRemoveMenuItem(screen)).toBeVisible()
    })

    test('Should remove file from list when Remove is clicked in actions menu', async () => {
      const { screen } = await setupBasicUploadScenario()

      await expect.element(screen.getByText('test.txt')).toBeVisible()
      await expect.element(screen.getByText('1 File Ready to Upload')).toBeVisible()

      await openActionsMenu(screen)

      const removeOption = getRemoveMenuItem(screen)
      await removeOption.click()

      // Should now show 0 files
      await expect.element(screen.getByText('0 Files Ready to Upload')).toBeVisible()
    })

    test('Should show Remove button (trash icon) for files not being uploaded', async () => {
      const { screen } = await setupBasicUploadScenario()

      await expect.element(screen.getByText('test.txt')).toBeVisible()
      await expect.element(screen.getByTitle('Remove file')).toBeVisible()
    })

    test('Should remove file when trash icon button is clicked', async () => {
      const screen = render(<FileUploadTrigger />)
      await openUploadModal(screen)

      const file1 = createTestFile('file1.txt', 'content1')
      const file2 = createTestFile('file2.txt', 'content2')
      await uploadFilesToModal([file1, file2])

      await expect.element(screen.getByText('2 Files Ready to Upload')).toBeVisible()

      const removeButton = screen.getByTitle('Remove file').first()
      await removeButton.click()

      await expect.element(screen.getByText('1 File Ready to Upload')).toBeVisible()
    })
  })

  describe('Multiple File Actions', () => {
    test('Should handle multiple files with actions', async () => {
      const screen = render(<FileUploadTrigger />)
      await openUploadModal(screen)

      const file1 = createTestFile('file1.txt', 'content1')
      const file2 = createTestFile('file2.txt', 'content2')
      await uploadFilesToModal([file1, file2])

      await expect.element(screen.getByText('2 Files Ready to Upload')).toBeVisible()

      // Both files should have actions buttons
      const actionsButtons = screen.getByLabelText('Actions')
      await expect.element(actionsButtons.first()).toBeVisible()
    })

    test('Should handle remove action on multiple files individually', async () => {
      const screen = render(<FileUploadTrigger />)
      await openUploadModal(screen)

      const file1 = createTestFile('file1.txt', 'content1')
      const file2 = createTestFile('file2.txt', 'content2')
      const file3 = createTestFile('file3.txt', 'content3')
      await uploadFilesToModal([file1, file2, file3])

      await expect.element(screen.getByText('3 Files Ready to Upload')).toBeVisible()

      // Remove first file
      const removeButton = screen.getByTitle('Remove file').first()
      await removeButton.click()

      await expect.element(screen.getByText('2 Files Ready to Upload')).toBeVisible()

      // Remove another file
      const remainingRemoveButton = screen.getByTitle('Remove file').first()
      await remainingRemoveButton.click()

      await expect.element(screen.getByText('1 File Ready to Upload')).toBeVisible()
    })
  })

  describe('Action Menu Interactions', () => {
    test('Should show actions menu when Actions button is clicked', async () => {
      const { screen } = await setupBasicUploadScenario()

      await expect.element(screen.getByText('test.txt')).toBeVisible()

      await openActionsMenu(screen)

      await expect.element(screen.getByRole('menu')).toBeVisible()
    })

    test('Should close actions menu after selecting Remove action', async () => {
      const { screen } = await setupBasicUploadScenario()

      await expect.element(screen.getByText('test.txt')).toBeVisible()

      await openActionsMenu(screen)

      await expect.element(screen.getByRole('menu')).toBeVisible()

      const removeOption = getRemoveMenuItem(screen)
      await removeOption.click()

      // Menu should close and file should be removed
      await expect.element(screen.getByText('0 Files Ready to Upload')).toBeVisible()
    })
  })
})
