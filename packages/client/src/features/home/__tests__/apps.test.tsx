import React from 'react'
import { render, screen, waitFor } from '../../../test/test-utils'
import { AppList } from '../../apps/AppList'

describe('My Home / Apps', () => {
  test('User should be allowed to view apps list', async () => {
    render(<AppList homeScope="me" />, { route: '/home/apps' })

    await waitFor(() => {
      const createButton = screen.getByTestId('home-apps-create-button')
      expect(createButton).toBeInTheDocument()
      const tableEl = screen.getByTestId('pfda-table')
      expect(tableEl).toBeInTheDocument()
    })
  })
})
