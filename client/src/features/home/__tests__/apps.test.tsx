import React from 'react'
import { Route } from 'react-router'
import { history, render, screen, act } from '../../../test/test-utils'
import { AppList } from '../apps/AppList'

describe('My Home / Apps', () => {
  test('User should be allowed to view apps list', async () => {
    history.replace('/home/apps')
    render(
      <Route path="/home/apps">
        <AppList scope="me" />
      </Route>,
    )

    await act(async () => {
      const createButton = screen.getByTestId('home-apps-create-button')
      expect(createButton).toBeInTheDocument()

      const tableEl = screen.getByTestId('pfda-table')
      expect(tableEl).toBeInTheDocument()
    })
  })
})
