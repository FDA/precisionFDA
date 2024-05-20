import React from 'react'
import { render, screen, waitFor } from '../../../test/test-utils'
import Home2 from '../index'

describe('My Home', () => {
  test('User should be allowed to view My Home and default to files list', async () => {
    render(<Home2 />, { route: '/home' })

    await waitFor(() => {
      const linkEl = screen.getByTestId('home-files-link')
      expect(linkEl).toHaveClass('active')
      const bannerEL = screen.getByTestId('home-banner')
      expect(bannerEL).toHaveTextContent('My Home')
    })
  })
})
