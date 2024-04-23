import { Meta, StoryObj } from '@storybook/react'
import React, { useEffect } from 'react'
import { WithListData } from '../../stories/helpers'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { fetchApps } from '../apps/apps.api'
import { fetchFiles } from '../files/files.api'
import { APIResource } from '../home/types'
import { useEditTagsModal } from './useEditTagsModal'

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
}
type Story = StoryObj<Props>

const EditTagsModalWrapper = (props: Props) => {
  const { modalComp, setShowModal } = useEditTagsModal({
    resource: props.type,
    selected: props.data,
  })

  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const EditTagsModal: Story = {
  render: ({ type = 'files' }) => {
    let fetchFunc: unknown
    if (type === 'files') {
      fetchFunc = fetchFiles
    }
    if (type === 'apps') {
      fetchFunc = fetchApps
    }
    return (
      <WithListData resource={type} fetchList={fetchFunc || fetchFiles}>
        {({ data }) => <EditTagsModalWrapper data={data[type][0]} type={type} />}
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
