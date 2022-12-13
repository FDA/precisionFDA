import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Button } from '../../../../components/Button'

test('It should render button', () => {
  render(<Button>My Test Button</Button>)
  const b = screen.getByText('My Test Button')
  expect(b).toHaveTextContent('My Test Button')
})
