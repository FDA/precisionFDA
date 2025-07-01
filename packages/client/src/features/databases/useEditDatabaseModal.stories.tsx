import { Meta, StoryObj } from '@storybook/react-webpack5'
import React, { useEffect } from 'react'
import { WithListData } from '../../stories/helpers'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { fetchDatabaseList } from './databases.api'
import { useEditDatabaseModal } from './useEditDatabaseModal'
import { IDatabase } from './databases.types'

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
  data: IDatabase
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
        {({ data }) => data && <EditDatabaseModalWrapper data={data.data[0]} />}
      </WithListData>
    )
  },
}

export default meta
