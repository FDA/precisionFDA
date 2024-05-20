import { Meta, StoryObj } from '@storybook/react'
import React, { useEffect } from 'react'
import { WithListData } from '../../stories/helpers'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { fetchApps } from '../apps/apps.api'
import { fetchFiles } from '../files/files.api'
import { APIResource } from '../home/types'
import { useCopyToSpaceModal } from './useCopyToSpace'

const meta: Meta = {
  title: 'Modals/Common',
}
type Props = {
  data: {id: string}[]
  type: APIResource
}
type Story = StoryObj<Props>

const CopyToSpaceModalWrapper = (props: Props) => {
  const { modalComp, setShowModal } = useCopyToSpaceModal({ selected: props.data, resource: props.type })

  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const CopyToSpaceModal: Story = {
  render: ({ type = 'files' }) => {
    let fetchFunc: unknown
    if(type === 'files') {
      fetchFunc = fetchFiles
    }
    if(type === 'apps') {
      fetchFunc = fetchApps
    }
    return (
    <StorybookProviders>
      <WithListData resource={type} fetchList={fetchFunc || fetchFiles}>
        {({ data }) => <CopyToSpaceModalWrapper data={data[type]} type={type} />}
      </WithListData>
    </StorybookProviders>
  )},
  argTypes: {
    type: {
      options: ['files', 'apps'] as APIResource[],
      control: { type: 'radio' },
    },
  },
}

export default meta
