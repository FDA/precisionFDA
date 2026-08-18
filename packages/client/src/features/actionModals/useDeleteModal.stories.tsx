import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect } from 'react'
import { mockDeleteApps } from '../../mocks/handlers/apps.handlers'
import { mockDeleteAssets } from '../../mocks/handlers/assets.handlers'
import { mockDeleteWorkflows } from '../../mocks/handlers/workflows.handlers'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { useDeleteModal } from './useDeleteModal'

const meta: Meta = {
  title: 'Modals/Common/Delete',
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

type DeleteItem = {
  id: string
  name: string
  location: string
}

const makeLongSelectedList = <T extends DeleteItem>(items: T[]) =>
  Array.from({ length: 10 }, (_, index) => {
    const item = items[index % items.length]
    const itemNumber = index + 1

    return {
      ...item,
      id: `${item.id}-${itemNumber}`,
      name: `${item.name} ${itemNumber}`,
    }
  })

const DeleteModalWrapper = ({ resource, multipleItems }: Props) => {
  const getSelectedData = () => {
    switch (resource) {
      case 'app':
        return multipleItems ? makeLongSelectedList(mockDeleteApps) : [mockDeleteApps[0]]
      case 'asset':
        return multipleItems ? makeLongSelectedList(mockDeleteAssets) : [mockDeleteAssets[0]]
      case 'workflow':
        return multipleItems ? makeLongSelectedList(mockDeleteWorkflows) : [mockDeleteWorkflows[0]]
      default:
        return [mockDeleteApps[0]]
    }
  }

  const { modalComp, setShowModal } = useDeleteModal({
    resource,
    selected: getSelectedData(),
    onSuccess: res => console.log('Delete success:', res),
    request: () => Promise.resolve({}),
  })

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return modalComp
}

export const Default: Story = {
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
