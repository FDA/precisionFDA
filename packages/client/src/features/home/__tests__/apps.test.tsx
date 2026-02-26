import { render, setAuthenticatedSession } from '../../../test/test-utils';
import { AppList } from '../../apps/AppList';


describe('My Home / Apps', () => {
  test('User should be allowed to view apps list', async () => {
    setAuthenticatedSession()
    const screen = render(<AppList homeScope="me" />, { route: '/home/apps' })

    await expect.element(screen.getByTestId('home-apps-create-button')).toBeInTheDocument()
    await expect.element(screen.getByTestId('pfda-table')).toBeInTheDocument()
  })
})
