import { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect } from 'react'
import { WithListData } from '../../../stories/helpers'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import { fetchAssets } from '../assets.api'
import { IAsset } from '../assets.types'
import { useDownloadAssetsModal } from './useDownloadAssetsModal'

const meta: Meta = {
  title: 'Modals/Assets',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}
type Props = {
  data: IAsset[]
}
type Story = StoryObj<Props>

const DownloadAssetsModalWrapper = (props: Props) => {
  const { modalComp, setShowModal } = useDownloadAssetsModal(props.data)

  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const DownloadAssetsModal: Story = {
  render: () => {
    return (
      <WithListData resource="assets" fetchList={fetchAssets}>
        {({ data }) => data && <DownloadAssetsModalWrapper data={data?.assets} />}
      </WithListData>
    )
  },
}

export default meta
