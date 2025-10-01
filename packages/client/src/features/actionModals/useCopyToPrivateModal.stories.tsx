import { Meta, StoryObj } from '@storybook/react-webpack5'
import React, { useEffect } from 'react'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { copyAppsToPrivate } from '../apps/apps.api'
import { APIResource } from '../home/types'
import { useCopyToPrivateModal } from './useCopyToPrivateModal'
import { mockCopyApps } from '../../mocks/handlers/apps.handlers'
import { mockCopyFiles } from '../../mocks/handlers/files.handlers'

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
          fetch('/api/files/copy', {
            method: 'POST',
            body: JSON.stringify({ item_ids: ids, scope: 'private' }),
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
