import { Meta, StoryObj } from '@storybook/react-vite'
import React, { useEffect } from 'react'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { mockExecutionsForTerminate } from '../../mocks/handlers/executions.handlers'
import { useTerminateModal } from './useTerminateModal'

const meta: Meta = {
  title: 'Modals/Executions',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

type Props = {
  multipleExecutions: boolean
}
type Story = StoryObj<Props>

const TerminateModalWrapper = ({ multipleExecutions }: Props) => {
  const selected = multipleExecutions ? mockExecutionsForTerminate : [mockExecutionsForTerminate[0]]
  
  const { modalComp, setShowModal } = useTerminateModal({ selected })

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return modalComp
}

export const TerminateModal: Story = {
  render: ({ multipleExecutions = false }) => {
    return <TerminateModalWrapper multipleExecutions={multipleExecutions} />
  },
  argTypes: {
    multipleExecutions: {
      control: { type: 'boolean' },
    },
  },
}

export default meta
