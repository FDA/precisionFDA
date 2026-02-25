import { render } from '@/test/test-utils'
import { useFileUploadModalContext } from './FileUploadModalProvider'

// Type for the screen object returned by render
export type Screen = ReturnType<typeof render>

// Test component to trigger modal
export const FileUploadTrigger = ({
  folderId,
  spaceId,
  folderPath,
}: {
  folderId?: string
  spaceId?: string
  folderPath?: Array<{ id: number; name: string }>
}) => {
  const { openModal, isModalShown } = useFileUploadModalContext()

  return (
    <div>
      <button data-testid="open-upload-modal" onClick={() => openModal({ folderId, spaceId, folderPath })}>
        Open Upload
      </button>
      <div data-testid="modal-shown">{isModalShown ? 'true' : 'false'}</div>
    </div>
  )
}

// Helper to open the upload modal
export const openUploadModal = async (screen: Screen) => {
  const button = screen.getByTestId('open-upload-modal')
  await button.click()
}

// Helper to upload files to the modal
export const uploadFilesToModal = async (files: File | File[]) => {
  const fileArray = Array.isArray(files) ? files : [files]
  // Get the file input element using document query (we're in browser context)
  const inputElement = document.querySelector('input[type="file"]') as HTMLInputElement

  if (inputElement) {
    // Create a DataTransfer object to set files
    const dataTransfer = new DataTransfer()
    fileArray.forEach(file => dataTransfer.items.add(file))
    inputElement.files = dataTransfer.files

    // Trigger change event to notify the dropzone
    inputElement.dispatchEvent(new Event('change', { bubbles: true }))
  }
}

// Helper to get the primary upload button
export const getPrimaryUploadButton = (screen: Screen) => {
  return screen.getByTestId('upload-modal-upload')
}

// Helper to click the primary upload button
export const clickPrimaryUploadButton = async (screen: Screen) => {
  const button = getPrimaryUploadButton(screen)
  await button.click()
}

// Helper to get actions button for a file
export const getActionsButton = (screen: Screen) => {
  return screen.getByRole('button', { name: 'Actions' })
}

// Helper to open actions menu
export const openActionsMenu = async (screen: Screen) => {
  const actionsButton = getActionsButton(screen)
  await actionsButton.click()
}

// Helper to create a test file
export const createTestFile = (name: string, content: string = 'content', type: string = 'text/plain') => {
  return new File([content], name, { type })
}

// Helper to setup a basic upload scenario (render, open modal, add file)
export const setupBasicUploadScenario = async (fileName: string = 'test.txt') => {
  const screen = render(<FileUploadTrigger />)
  await openUploadModal(screen)

  const file = createTestFile(fileName)
  await uploadFilesToModal(file)

  return { screen, file }
}

// Helper to start an upload
export const startUpload = async (screen: Screen) => {
  const button = getPrimaryUploadButton(screen)
  await button.click()
}

// Helper to close the modal
export const closeModal = async (screen: Screen) => {
  const closeButton = screen.getByTestId('modal-close-button')
  await closeButton.click()
}

// Helper to get the Remove menu item (not "Remove all" button)
export const getRemoveMenuItem = (screen: Screen) => {
  return screen.getByRole('menuitem', { name: 'Remove' })
}
