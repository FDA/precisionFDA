import React from 'react'
import { Meta, StoryObj } from '@storybook/react-webpack5'
import Header from './HeaderNext'
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

export const LoggedIn: StoryObj = {}

export default meta
