import React from 'react'
import { Meta, StoryObj } from '@storybook/react'
import { Button } from '.'
import { StorybookProviders } from '../../stories/StorybookProviders'

type Story = StoryObj<typeof Button>;


const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  decorators: [
    (Story) => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

export const Primary: Story = {
  args: {
    'data-variant': 'primary',
    children: 'Primary',
  },
}
export const Danger: Story = {
  args: {
    'data-variant': 'warning',
    children: 'Danger',
  },
}
export const Green: Story = {
  args: {
    'data-variant': 'success',
    children: 'Continue',
  },
}
export const Outline: Story = {
  args: {
    children: 'Click Me',
  },
}

export default meta
