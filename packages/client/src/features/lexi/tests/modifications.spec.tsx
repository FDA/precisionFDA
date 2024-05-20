import React from 'react'

import { LexiContext } from '..'
import { fireEvent, render, screen, act, userEvent, waitFor } from '../../../test/test-utils'
import Editor from '../Editor'

describe('Lexical Editor', () => {
  beforeAll(() => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
    }))
  })

  it('should have custom resource image insert component', async () => {
    render(
      <LexiContext>
        <Editor />
      </LexiContext>,
    )
    await act(async () => {
      const insertButton = await screen.getByText('Insert')
      await userEvent.click(insertButton)
    })

    await act(async () => {
      const imageItem = await screen.getByText('Image')
      await userEvent.click(imageItem)
    })

    await act(async () => {
      const resourceSelect = await screen.getByTestId('lexi-resource-select')
      expect(resourceSelect).toBeInTheDocument()
    })
  })

  it('should have default font of Lato', async () => {
    render(
      <LexiContext>
        <Editor />
      </LexiContext>,
    )
    await act(async () => {
      const fontFamilyDropdown = await screen.getByTestId('font-family-dropdown')
      expect(fontFamilyDropdown).toHaveTextContent('Lato')
    })
  })
})
