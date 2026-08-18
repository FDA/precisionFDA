import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMutation } from '@tanstack/react-query'
import { useOpenModalInStory } from '@/stories/useOpenModalInStory'
import { toastError, toastSuccess } from '../../components/NotificationCenter/ToastHelper'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { useAddResourceToModal } from './useAddResourceToSpace'

const meta: Meta = {
  title: 'Modals/Common/Add Resource to Space',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

type Props = {
  resource: 'apps' | 'workflows'
  spaceId?: string
}

type Story = StoryObj<Props>

const mockAddDataRequest = async ({ spaceId, uids }: { spaceId?: string; uids: string[] }) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log('Mock add data request:', { spaceId, uids })
  return { success: true }
}

const AddResourceToSpaceModalWrapper = ({ resource, spaceId }: Props) => {
  const mutation = useMutation({
    mutationKey: ['add-resource-to-space', resource],
    mutationFn: mockAddDataRequest,
    onError: (e: Error) => {
      toastError(`Error adding resource to space: ${e.message}`)
    },
  })

  const { modalComp, setShowModal } = useAddResourceToModal({
    spaceId,
    resource,
    mutation,
    onSuccess: () => {
      toastSuccess(`Successfully added ${resource} resource(s) to space`)
      setShowModal(false)
    },
  })

  useOpenModalInStory(setShowModal)

  return modalComp
}

export const Apps: Story = {
  render: ({ spaceId = 'space-123' }) => {
    return <AddResourceToSpaceModalWrapper resource="apps" spaceId={spaceId} />
  },
  args: {
    spaceId: 'space-123',
  },
}

export const Workflows: Story = {
  render: ({ spaceId = 'space-456' }) => {
    return <AddResourceToSpaceModalWrapper resource="workflows" spaceId={spaceId} />
  },
  args: {
    spaceId: 'space-456',
  },
}

export const WithoutSpaceId: Story = {
  render: () => {
    return <AddResourceToSpaceModalWrapper resource="apps" />
  },
}

export default meta
