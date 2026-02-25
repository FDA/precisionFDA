import { describe, expect, test } from 'vitest'
import { closeModal, createTestFile, uploadFilesToModal } from '../_test-helpers'
import { render } from '@/test/test-utils'
import { useFileUploadModalContext, type FileUploadModalOpenOptions } from '../FileUploadModalProvider'

// Reusable test component for single folder
const SingleFolderButton = ({
  folderId = '1',
  label = 'Open',
  options,
}: {
  folderId?: string
  label?: string
  options?: Partial<FileUploadModalOpenOptions>
}) => {
  const { openModal } = useFileUploadModalContext()
  return <button onClick={() => openModal({ folderId, ...options })}>{label}</button>
}

// Reusable test component for multiple folders
const MultiFolderButtons = ({ folders }: { folders: Array<{ folderId: string; label: string; spaceId?: string }> }) => {
  const { openModal } = useFileUploadModalContext()
  return (
    <div>
      {folders.map(({ folderId, label, spaceId }) => (
        <button key={`${folderId}-${spaceId || 'no-space'}`} onClick={() => openModal({ folderId, spaceId })}>
          {label}
        </button>
      ))}
    </div>
  )
}

describe('FileUploadModalProvider', () => {
  describe('Modal Opening', () => {
    test('Should open modal when openModal is called', async () => {
      const screen = render(<SingleFolderButton />)

      await screen.getByText('Open').click()

      await expect.element(screen.getByTestId('modal-files-upload')).toBeVisible()
    })

    test('Should add files to the upload queue', async () => {
      const screen = render(<SingleFolderButton />)

      await screen.getByText('Open').click()

      await expect.element(screen.getByTestId('modal-files-upload')).toBeVisible()

      // Add a file
      const file = createTestFile('test.txt', 'content')
      await uploadFilesToModal(file)

      await expect.element(screen.getByText('test.txt')).toBeVisible()
      await expect.element(screen.getByText('1 File Ready to Upload')).toBeVisible()
    })
  })

  describe('Location Handling', () => {
    test('Should open modal for different location when no active upload', async () => {
      const screen = render(
        <MultiFolderButtons
          folders={[
            { folderId: '1', label: 'Open Folder 1' },
            { folderId: '2', label: 'Open Folder 2' },
          ]}
        />,
      )

      // Open modal for folder 1 and add file
      await screen.getByText('Open Folder 1').click()

      await expect.element(screen.getByTestId('modal-files-upload')).toBeVisible()

      const file = createTestFile('test.txt', 'content')
      await uploadFilesToModal(file)

      await expect.element(screen.getByText('test.txt')).toBeVisible()

      // Close the modal first
      await closeModal(screen)

      // Open different location - should open without conflict since no upload is active
      await screen.getByText('Open Folder 2').click()

      // The modal should open for the new location
      await expect.element(screen.getByTestId('modal-files-upload')).toBeVisible()
    })

    test('Should clear files when modal is closed and reopened', async () => {
      const screen = render(<SingleFolderButton folderId="1" label="Open Folder 1" />)

      // Open modal and add file
      await screen.getByText('Open Folder 1').click()

      await expect.element(screen.getByTestId('modal-files-upload')).toBeVisible()

      const file = createTestFile('test.txt', 'content')
      await uploadFilesToModal(file)

      await expect.element(screen.getByText('test.txt')).toBeVisible()
      await expect.element(screen.getByText('1 File Ready to Upload')).toBeVisible()

      // Close the modal (files are cleared on close)
      await closeModal(screen)

      // Reopen same location
      await screen.getByText('Open Folder 1').click()

      // Files should be cleared - modal starts fresh
      await expect.element(screen.getByText('0 Files Ready to Upload')).toBeVisible()
    })
  })
})
