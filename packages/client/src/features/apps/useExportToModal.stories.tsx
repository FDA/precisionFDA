import type { Meta, StoryObj } from '@storybook/react-vite'
import { useOpenModalInStory } from '@/stories/useOpenModalInStory'
import { mockExportApp } from '../../mocks/handlers/apps.handlers'
import { mockExportWorkflow } from '../../mocks/handlers/workflows.handlers'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { type ExportToResource, useExportToModal } from './useExportToModal'

const meta: Meta = {
  title: 'Modals/Apps/Export To',
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

  useOpenModalInStory(setShowModal)

  return modalComp
}

export const Default: Story = {
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
