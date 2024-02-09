import React from 'react'
import {
  render,
  screen,
  waitFor,
} from '../../../test/test-utils'
import { FileList } from '../../files/FileList'

describe('My Home / Files', () => {
  test('User should be allowed to view files list', async () => {
    render(<FileList homeScope="me" showFolderActions />, { route: '/home/files' })

    await waitFor(async () => {
      const tableEl = screen.getByTestId('pfda-table')
      expect(tableEl).toBeInTheDocument()
      const rowEls = screen.getAllByTestId('data-row')
      expect(rowEls.length).toBe(6)
    })
  })
})
