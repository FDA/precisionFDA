import React from 'react'

import { LexiContext } from '..'
import { render, screen, userEvent } from '../../../test/test-utils'
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
    { route: '/data-portals/my-portal/content' })

    const insertButton = screen.getByText('Insert')
    await userEvent.click(insertButton)

    const imageItem = screen.getByText('Image')
    await userEvent.click(imageItem)

    const resourceSelect = screen.getByTestId('lexi-resource-select')
    expect(resourceSelect).toBeInTheDocument()
  })

  it('should have default font of Lato', async () => {
    render(
      <LexiContext>
        <Editor />
      </LexiContext>,
    )
    const fontFamilyDropdown = screen.getByTestId('font-family-dropdown')
    expect(fontFamilyDropdown).toHaveTextContent('Lato')
  })
})
