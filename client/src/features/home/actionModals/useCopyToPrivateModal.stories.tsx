import { Meta, StoryObj } from '@storybook/react'
import React, { useEffect } from 'react'
import { WithListData } from '../../../stories/helpers'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import { copyAppsToPrivate, fetchApps } from '../apps/apps.api'
import { copyFilesToPrivate, fetchFiles } from '../files/files.api'
import { APIResource } from '../types'
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
  data: Partial<{ uid: string }>[]
  type: APIResource
  request: (a: any) => Promise<any>
}
type Story = StoryObj<Props>

const CopyToPrivateModalWrapper = (props: Props) => {
  const { modalComp, setShowModal } = useCopyToPrivateModal({
    request: props.request,
    resource: props.type,
    selected: props.data,
  })

  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const CopyToPrivateModal: Story = {
  render: ({ type = 'files' }) => {
    let fetchFunc: unknown
    let request = copyFilesToPrivate
    if (type === 'files') {
      fetchFunc = fetchFiles
      request = copyFilesToPrivate
    }
    if (type === 'apps') {
      fetchFunc = fetchApps
      request = copyAppsToPrivate
    }
    return (
      <WithListData resource={type} fetchList={fetchFunc || fetchFiles}>
        {({ data }) => <CopyToPrivateModalWrapper data={data[type]} type={type} request={request} />}
      </WithListData>
    )
  },
  argTypes: {
    type: {
      options: ['files', 'apps'] as APIResource[],
      control: { type: 'radio' },
    },
  },
}

export default meta
