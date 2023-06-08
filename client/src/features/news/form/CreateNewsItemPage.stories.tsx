import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import CreateNewsItemPage from './CreateNewsItemPage'

const meta: Meta = {
  title: 'News/Admin/Create Page',
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

export const CreateNewsItem: Story = {
  render: () => (
    <CreateNewsItemPage />
  ),
}

export default meta
