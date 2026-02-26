import { render, setAuthenticatedSession } from '@/test/test-utils'
import Header from './HeaderNext'

test('Logged in user should see My Home link', async () => {
  setAuthenticatedSession()
  const screen = render(<Header />, { route: '/' })
  await expect.element(screen.getByTestId('main-header')).toBeInTheDocument()
})
