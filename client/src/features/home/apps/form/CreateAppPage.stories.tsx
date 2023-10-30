import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { CreateAppPage as CreateAppPageImport } from './CreateAppPage'
import { StorybookProviders } from '../../../../stories/StorybookProviders'

const meta: Meta = {
  title: 'Apps/Create',
  component: CreateAppPageImport,
}

const CreateAppPageWrapper = (args: any) => {
  return <StorybookProviders><CreateAppPageImport /></StorybookProviders>
}

export const CreateAppPage: StoryObj = {
  render: args => <CreateAppPageWrapper {...args} />,
  args: {
    loading: false,
    isSelectable: true,
    isExpandable: true,
    isFilterable: true,
    isSortable: true,
  },
}

export default meta
