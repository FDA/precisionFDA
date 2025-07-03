import { Meta, StoryObj } from '@storybook/react-webpack5'
import React, { useEffect } from 'react'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { mockWorkstationExecution } from '../../mocks/handlers/executions.handlers'
import { IExecution } from './executions.types'
import { useSnapshotModal } from './useSnapshotModal'

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
  workstationState: 'running' | 'stopped'
}
type Story = StoryObj<Props>

const SnapshotModalWrapper = ({ workstationState }: Props) => {
  const workstation = {
    ...mockWorkstationExecution,
    state: workstationState,
  }
  
  const { modalComp, setShowModal } = useSnapshotModal({ 
    selected: workstation as IExecution,
  })

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return modalComp
}

export const SnapshotModal: Story = {
  render: ({ workstationState = 'running' }) => {
    return <SnapshotModalWrapper workstationState={workstationState} />
  },
  argTypes: {
    workstationState: {
      options: ['running', 'stopped'],
      control: { type: 'radio' },
    },
  },
}

export default meta
