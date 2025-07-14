import { Meta, StoryObj } from '@storybook/react-webpack5'
import React, { useEffect } from 'react'
import { WithListData } from '../../stories/helpers'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { fetchApps } from '../apps/apps.api'
import { fetchFiles } from '../files/files.api'
import { APIResource } from '../home/types'
import { useEditTagsModal } from './useEditTagsModal'
import { IFile } from '../files/files.types'
import { IApp } from '../apps/apps.types'

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

type TaggableResource = {
  uid: string
  name: string
  tags: string[]
}

type Props = {
  data: TaggableResource
  type: APIResource
}
type Story = StoryObj<Props>

const EditTagsModalWrapper = (props: Props) => {
  const { modalComp, setShowModal } = useEditTagsModal({
    resource: props.type,
    selected: props.data,
  })

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])
  return modalComp
}

export const EditTagsModal: Story = {
  render: ({ type = 'files' }) => {
    if (type === 'files') {
      return (
        <WithListData resource={type} fetchList={fetchFiles}>
          {({ data }) => {
            const files = data?.files || []
            const firstItem = files[0] as IFile
            
            if (!firstItem) {
              return <div>No data available</div>
            }
            
            return <EditTagsModalWrapper data={firstItem} type={type} />
          }}
        </WithListData>
      )
    } else if (type === 'apps') {
      return (
        <WithListData resource={type} fetchList={fetchApps}>
          {({ data }) => {
            const apps = data?.apps || []
            const firstItem = apps[0] as IApp
            
            if (!firstItem) {
              return <div>No data available</div>
            }
            
            return <EditTagsModalWrapper data={firstItem} type={type} />
          }}
        </WithListData>
      )
    } else {
      return <div>Unsupported resource type</div>
    }
  },
  argTypes: {
    type: {
      options: ['files', 'apps'] as APIResource[],
      control: { type: 'radio' },
    },
  },
}

export default meta
