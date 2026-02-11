import { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect } from 'react'
import { WithListData } from '../../stories/helpers'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { fetchApps } from './apps.api'
import { IApp } from './apps.types'
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
  data: IApp
}
type Story = StoryObj<Props>

const ExportToModalWrapper = (props: Props) => {
  const { modalComp, setShowModal } = useExportToModal({ selected: props.data, resource: 'apps' })

  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const ExportToModal: Story = {
  render: () => (
    <WithListData resource="apps" fetchList={fetchApps}>
      {({ data }) => data?.apps?.[0] ? <ExportToModalWrapper data={data.apps[0]} /> : null}
    </WithListData>
  ),
}

export default meta
