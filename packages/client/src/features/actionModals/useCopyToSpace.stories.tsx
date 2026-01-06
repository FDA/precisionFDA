import { Meta, StoryObj } from '@storybook/react-webpack5'
import React, { useEffect } from 'react'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { copyAppsRequest } from '../apps/apps.api'
import { copyFilesRequest } from '../files/files.api'
import { APIResource } from '../home/types'
import { mockCopyToSpaceFiles } from '../../mocks/handlers/files.handlers'
import { mockCopyToSpaceApps } from '../../mocks/handlers/apps.handlers'
import { useCopyToSpaceModal } from './useCopyToSpace'
import { toast } from 'react-toastify'

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
  type: APIResource
}
type Story = StoryObj<Props>

const CopyToSpaceModalWrapper = ({ type }: Props) => {
  const mockData = type === 'apps' ? mockCopyToSpaceApps : mockCopyToSpaceFiles
  const updateFunction = type === 'apps' ? copyAppsRequest : 
    (scope: string, ids: string[]) => copyFilesRequest(scope, ids.map(id => parseInt(id, 10)))

  const { modalComp, setShowModal } = useCopyToSpaceModal({
    selected: mockData,
    resource: type,
    updateFunction,
    onSuccess: () => {
      toast.success('Copying to space started')
    },
  })

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])
  
  return modalComp
}

export const CopyToSpaceModal: Story = {
  render: ({ type = 'files' }) => {
    return <CopyToSpaceModalWrapper type={type} />
  },
  argTypes: {
    type: {
      options: ['files', 'apps'] as APIResource[],
      control: { type: 'radio' },
    },
  },
}

export default meta
