import { Meta, StoryObj } from '@storybook/react-vite'
import { StorybookProviders } from '../../stories/StorybookProviders'
import ListAdminNewsPage from './ListAdminNews'

const meta: Meta = {
  title: 'News/Admin/List Page',
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

export const Default: Story = {
  render: () => <ListAdminNewsPage />,
}

export default meta
