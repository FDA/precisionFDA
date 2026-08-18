import type { Meta, StoryObj } from '@storybook/react-vite'
import { useOpenModalInStory } from '@/stories/useOpenModalInStory'
import { mockForkApp } from '../../mocks/handlers/apps.handlers'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { useForkAppToModal } from './useForkAppToModal'

const meta: Meta = {
  title: 'Modals/Apps/Fork App To',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

type Props = {
  hasApp: boolean
}
type Story = StoryObj<Props>

const ForkAppToModalWrapper = ({ hasApp }: Props) => {
  const { modalComp, setShowModal } = useForkAppToModal({
    selectedApp: hasApp ? mockForkApp : undefined,
  })

  useOpenModalInStory(setShowModal)

  return modalComp
}

export const Default: Story = {
  render: ({ hasApp = true }) => {
    return <ForkAppToModalWrapper hasApp={hasApp} />
  },
  argTypes: {
    hasApp: {
      control: { type: 'boolean' },
    },
  },
}

export default meta
