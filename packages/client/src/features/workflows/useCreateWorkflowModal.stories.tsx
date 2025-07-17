import { Meta, StoryObj } from '@storybook/react-webpack5'
import React, { useEffect } from 'react'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { useCreateWorkflowModal } from './useCreateWorkflowModal'
import { workflowMocks } from '../../mocks/handlers/workflows.handlers'

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
