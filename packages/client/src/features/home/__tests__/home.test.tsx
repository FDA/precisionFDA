import { render } from '../../../test/test-utils'
import HomeShowLayout from '../HomeShowLayout'

describe('My Home', () => {
  test('User should be allowed to view My Home and default to files list', async () => {
    const screen = render(<HomeShowLayout />, { route: '/home/files' })

    await expect.element(screen.getByTestId('home-files-link')).toHaveClass('active')
    await expect.element(screen.getByTestId('home-banner')).toHaveTextContent('My Home')
  })
})
