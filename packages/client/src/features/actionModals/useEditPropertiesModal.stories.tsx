import React, { useEffect } from 'react'
import { Meta, StoryObj } from '@storybook/react'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { WithListData } from '../../stories/helpers'
import { APIResource } from '../home/types'
import { fetchFiles } from '../files/files.api'
import { fetchApps } from '../apps/apps.api'
import { useEditPropertiesModal } from './useEditPropertiesModal'

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

const EditPropertiesModalWrapper = (props: Props) => {
  const { modalComp, setShowModal } = useEditPropertiesModal({
    resource: props.type,
    selected: props.data,
  })

  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const EditPropertiesModal: Story = {
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
        {({ data }) => <EditPropertiesModalWrapper data={data[type][0]} type={type} />}
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