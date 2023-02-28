import { Meta, StoryObj } from '@storybook/react'
import React, { useEffect } from 'react'
import { WithListData } from '../../../stories/helpers'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import { fetchDatabaseList } from './databases.api'
import { useEditDatabaseModal } from './useEditDatabaseModal'

const meta: Meta = {
  title: 'Modals/Databases',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}
type Props = {
  data: Partial<{ uid: string, id: string }>
}
type Story = StoryObj<Props>

const EditDatabaseModalWrapper = (props: Props) => {
  const { modalComp, setShowModal } = useEditDatabaseModal(props.data)

  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const EditDatabaseModal: Story = {
  render: () => {
    return (
      <WithListData resource="dbclusters" fetchList={fetchDatabaseList}>
        {({ data }) => <EditDatabaseModalWrapper data={data['dbclusters'][0]} />}
      </WithListData>
    )
  },
}

export default meta
