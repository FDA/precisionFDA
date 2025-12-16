import { Meta, StoryObj } from '@storybook/react-webpack5'
import { useMutation } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import { toastError, toastSuccess } from '../../components/NotificationCenter/ToastHelper'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { useAddResourceToModal } from './useAddResourceToSpace'

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
    spaceId: spaceId!,
    resource,
    mutation,
    onSuccess: () => {
      toastSuccess(`Successfully added ${resource} resource(s) to space`)
      setShowModal(false)
    },
  })

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return modalComp
}

export const AddAppsToSpaceModal: Story = {
  render: ({ spaceId = 'space-123' }) => {
    return <AddResourceToSpaceModalWrapper resource="apps" spaceId={spaceId} />
  },
  args: {
    spaceId: 'space-123',
  },
}

export const AddWorkflowsToSpaceModal: Story = {
  render: ({ spaceId = 'space-456' }) => {
    return <AddResourceToSpaceModalWrapper resource="workflows" spaceId={spaceId} />
  },
  args: {
    spaceId: 'space-456',
  },
}

export const AddResourceToSpaceModalWithoutSpaceId: Story = {
  render: () => {
    return <AddResourceToSpaceModalWrapper resource="apps" />
  },
}

export default meta
