import { render } from '../../test/test-utils'
import Header from './HeaderNext'

test('Logged in user should see My Home link', async () => {
  const screen = render(<Header />, { route: '/' })
  await expect.element(screen.getByTestId('main-header')).toBeInTheDocument()
})
