import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import { render, screen, waitFor } from '../../test/test-utils'
import { Header } from './index'

test('Logged in user should see My Home link', async () => {
  render(<Header />)
  await waitFor(async () => {
    const element = await screen.findByTestId('main-header')
    expect(element).toHaveTextContent('My Home')
  })
})
