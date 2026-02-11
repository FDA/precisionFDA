import { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect } from 'react'
import { mockForkApp } from '../../mocks/handlers/apps.handlers'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { useForkAppToModal } from './useForkAppToModal'

const meta: Meta = {
  title: 'Modals/Apps',
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

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return modalComp
}

export const ForkAppToModal: Story = {
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
