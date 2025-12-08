import React from 'react'
import { render, screen, waitFor } from '../../../test/test-utils'
import { HomeShowLayout } from '../show/HomeShowLayout'

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useOutletContext: () => ({
    homeScope: 'me',
    handleSetHomeScope: jest.fn(),
  }),
  useSearchParams: () => [new URLSearchParams({ scope: 'me' }), jest.fn()],
}))

describe('My Home', () => {
  test('User should be allowed to view My Home and default to files list', async () => {
    render(<HomeShowLayout />, { route: '/home/files' })

    await waitFor(() => {
      const linkEl = screen.getByTestId('home-files-link')
      expect(linkEl).toHaveClass('active')
      const bannerEL = screen.getByTestId('home-banner')
      expect(bannerEL).toHaveTextContent('My Home')
    })
  })
})
