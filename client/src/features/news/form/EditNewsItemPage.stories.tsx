import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import EditNewsItemPage from './EditNewsItemPage'

const meta: Meta = {
  title: 'News/Admin/Edit Page',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

type Props = {
  data: { id: string }[]
}
type Story = StoryObj<Props>

export const EditNewsItem: Story = {
  render: () => (
    <EditNewsItemPage />
  ),
}

export default meta
