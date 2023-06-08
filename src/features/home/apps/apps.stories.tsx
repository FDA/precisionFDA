import { Meta, StoryObj } from '@storybook/react'
import React, { useEffect } from 'react'
import { WithListData } from '../../../stories/helpers'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import { fetchApps } from './apps.api'
import { useExportToModal } from './useExportToModal'

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
  data: {id: string}[]
}
type Story = StoryObj<Props>

const ExportToModalWrapper = (props: Props) => {
  const { modalComp, setShowModal } = useExportToModal({ selected: props.data })

  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const ExportToModal: Story = {
  render: () => (
    <WithListData resource="apps" fetchList={fetchApps}>
      {({ data }) => <ExportToModalWrapper data={data.apps[0]} />}
    </WithListData>
  ),
}

export default meta
