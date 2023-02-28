import React from 'react'
import { Meta, StoryObj } from '@storybook/react'
import { Header } from '.'
import { StorybookProviders } from '../../stories/StorybookProviders'

const meta: Meta = {
  title: 'Components/Header',
  component: Header,
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

export const LoggedIn: StoryObj = {
  render: () => (<Header />),
}

export default meta
