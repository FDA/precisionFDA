import { render, setAuthenticatedSession } from '../../../test/test-utils';
import { FileList } from '../../files/FileList';


describe('My Home / Files', () => {
  test('User should be allowed to view files list', async () => {
    setAuthenticatedSession()
    const screen = render(<FileList homeScope="me" showFolderActions />, { route: '/home/files' })

    await expect.element(screen.getByTestId('pfda-table')).toBeInTheDocument()
    // Poll until all data rows are loaded
    await expect.poll(() => screen.getByTestId('data-row').elements().length).toBe(6)
  })
})
