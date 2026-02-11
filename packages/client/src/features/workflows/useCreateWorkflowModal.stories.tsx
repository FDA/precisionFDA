import { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect } from 'react'
import { workflowMocks } from '../../mocks/handlers/workflows.handlers'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { useCreateWorkflowModal } from './useCreateWorkflowModal'

const meta: Meta = {
  title: 'Modals/Workflows',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
  parameters: {
    msw: {
      handlers: workflowMocks,
    },
  },
}

type Story = StoryObj<Record<string, never>>

const CreateWorkflowModalWrapper = () => {
  const { modalComp, setShowModal } = useCreateWorkflowModal()

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])
  return modalComp
}

export const CreateWorkflowModal: Story = {
  render: () => {
    return <CreateWorkflowModalWrapper />
  },
}

export default meta
