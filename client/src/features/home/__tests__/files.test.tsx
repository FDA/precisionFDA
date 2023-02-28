import React from 'react'
import { Route } from 'react-router'
import { history, render, screen, waitFor } from '../../../test/test-utils'
import { FileList } from '../files/FileList'

describe('My Home / Files', () => {
  test('User should be allowed to view files list', async () => {
    history.replace('/home/files')
    render(
      <Route path="/home/files">
        <FileList scope="me" showFolderActions />
      </Route>,
    )

    await waitFor(async () => {
      const tableEl = screen.getByTestId('pfda-table')
      expect(tableEl).toBeInTheDocument()
      const rowEls = screen.getAllByRole('row')
      expect(rowEls.length).toBe(8)
    })
  })
})
