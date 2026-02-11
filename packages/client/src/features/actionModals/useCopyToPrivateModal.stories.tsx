import { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect } from 'react'
import { mockCopyApps } from '../../mocks/handlers/apps.handlers'
import { mockCopyFiles } from '../../mocks/handlers/files.handlers'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { copyAppsToPrivate } from '../apps/apps.api'
import { APIResource } from '../home/types'
import { useCopyToPrivateModal } from './useCopyToPrivateModal'

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

const CopyToPrivateModalWrapper = ({ type }: Props) => {
  const mockData = type === 'apps' ? mockCopyApps.apps : mockCopyFiles.files
  const copyFunction =
    type === 'apps'
      ? copyAppsToPrivate
      : (ids: number[]) =>
          fetch('/api/v2/nodes/copy', {
            method: 'POST',
            body: JSON.stringify({ ids, scope: 'private' }),
            headers: { 'Content-Type': 'application/json' },
          }).then(r => r.json())

  const { modalComp, setShowModal } = useCopyToPrivateModal({
    copyFunction,
    resource: type,
    selected: mockData,
  })

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return modalComp
}

export const CopyToPrivateModal: Story = {
  render: ({ type = 'files' }) => {
    return <CopyToPrivateModalWrapper type={type} />
  },
  argTypes: {
    type: {
      options: ['files', 'apps'] as APIResource[],
      control: { type: 'radio' },
    },
  },
}

export default meta
