import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { CreateAppPage as CreateAppPageImport } from './CreateAppPage'
import { StorybookProviders } from '../../../stories/StorybookProviders'

const meta: Meta = {
  title: 'Apps/Create',
  component: CreateAppPageImport,
}

const CreateAppPageWrapper = () => {
  return <StorybookProviders><CreateAppPageImport /></StorybookProviders>
}

export const CreateAppPage: StoryObj = {
  render: args => <CreateAppPageWrapper {...args} />,
}

export default meta
