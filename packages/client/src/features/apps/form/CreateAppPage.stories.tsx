import { Meta, StoryObj } from '@storybook/react-vite'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import { CreateAppPage as CreateAppPageImport } from './CreateAppPage'

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
