import { Meta, StoryObj } from '@storybook/react-vite'
import { StorybookProviders } from '../../stories/StorybookProviders'
import Header from './HeaderNext'

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
