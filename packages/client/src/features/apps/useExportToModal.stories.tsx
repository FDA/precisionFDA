import { Meta, StoryObj } from '@storybook/react-webpack5'
import React, { useEffect } from 'react'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { useExportToModal, ExportToResource } from './useExportToModal'
import { mockExportApp } from '../../mocks/handlers/apps.handlers'
import { mockExportWorkflow } from '../../mocks/handlers/workflows.handlers'

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
  resource: ExportToResource
}
type Story = StoryObj<Props>

const ExportToModalWrapper = ({ resource }: Props) => {
  const selected = resource === 'apps' ? mockExportApp : mockExportWorkflow

  const { modalComp, setShowModal } = useExportToModal({
    selected,
    resource,
  })

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return modalComp
}

export const ExportToModal: Story = {
  render: ({ resource = 'apps' }) => {
    return <ExportToModalWrapper resource={resource} />
  },
  argTypes: {
    resource: {
      options: ['apps', 'workflows'] as ExportToResource[],
      control: { type: 'radio' },
    },
  },
}

export default meta
