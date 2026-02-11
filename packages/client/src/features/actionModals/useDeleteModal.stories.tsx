import { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect } from 'react'
import { mockDeleteApps } from '../../mocks/handlers/apps.handlers'
import { mockDeleteAssets } from '../../mocks/handlers/assets.handlers'
import { mockDeleteWorkflows } from '../../mocks/handlers/workflows.handlers'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { useDeleteModal } from './useDeleteModal'

const meta: Meta = {
  title: 'Modals/Common',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

type Props = {
  resource: 'app' | 'asset' | 'workflow'
  multipleItems: boolean
}
type Story = StoryObj<Props>

const DeleteModalWrapper = ({ resource, multipleItems }: Props) => {
  const getSelectedData = () => {
    switch (resource) {
      case 'app':
        return multipleItems ? mockDeleteApps : [mockDeleteApps[0]]
      case 'asset':
        return multipleItems ? mockDeleteAssets : [mockDeleteAssets[0]]
      case 'workflow':
        return multipleItems ? mockDeleteWorkflows : [mockDeleteWorkflows[0]]
      default:
        return [mockDeleteApps[0]]
    }
  }

  const { modalComp, setShowModal } = useDeleteModal({
    resource,
    selected: getSelectedData(),
    onSuccess: (res) => console.log('Delete success:', res),
    request: () => Promise.resolve({}),
  })

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return modalComp
}

export const DeleteModal: Story = {
  render: ({ resource = 'app', multipleItems = false }) => {
    return <DeleteModalWrapper resource={resource} multipleItems={multipleItems} />
  },
  argTypes: {
    resource: {
      options: ['app', 'asset', 'workflow'],
      control: { type: 'radio' },
    },
    multipleItems: {
      control: { type: 'boolean' },
    },
  },
}

export default meta
