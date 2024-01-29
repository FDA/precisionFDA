import { Meta, StoryObj } from '@storybook/react'
import React, { useEffect } from 'react'
import { WithListData } from '../../stories/helpers'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { fetchFiles } from '../files/files.api'
import { ATTACHABLE_TYPES, useAttachToModal } from './useAttachToModal'
import { APIResource } from '../home/types'
import { fetchApps } from '../apps/apps.api'

const meta: Meta = {
  title: 'Modals/Common',
}
type Props = {
  data: {id: string}[]
  type: ATTACHABLE_TYPES
}
type Story = StoryObj<Props>

const AttachToModalWrapper = (props: Props) => {
  const { modalComp, setShowModal } = useAttachToModal(props.data.map(i => i.id), props.type)

  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const AttachToModal: Story = {
  render: ({ type = 'FILE' }) => {
    let resource: APIResource = 'files'
    let fetchFunc: unknown
    if(type === 'FILE') {
      resource = 'files'
      fetchFunc = fetchFiles
    }
    if(type === 'APP') {
      resource = 'apps'
      fetchFunc = fetchApps
    }
    return (
    <StorybookProviders>
      <WithListData resource={resource} fetchList={fetchFunc || fetchFiles}>
        {({ data }) => <AttachToModalWrapper data={data[resource]} type={type} />}
      </WithListData>
    </StorybookProviders>
  )},
  argTypes: {
    type: {
      options: ['FILE', 'APP'],
      control: { type: 'radio' },
    },
  },
}

export default meta
