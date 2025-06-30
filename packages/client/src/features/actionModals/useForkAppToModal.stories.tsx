import { Meta, StoryObj } from '@storybook/react-webpack5'
import React, { useEffect } from 'react'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { mockForkApp } from '../../mocks/handlers/apps.handlers'
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
