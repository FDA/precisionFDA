import { Meta, StoryObj } from '@storybook/react-webpack5'
import React from 'react'
import { CreateAppPage as CreateAppPageImport } from './CreateAppPage'
import { StorybookProviders } from '../../../stories/StorybookProviders'

const meta: Meta = {
  title: 'Apps/Create',
  component: CreateAppPageImport,
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

export const CreateAppPage: StoryObj = {
  render: args => <CreateAppPageImport {...args} />,
}

export default meta
