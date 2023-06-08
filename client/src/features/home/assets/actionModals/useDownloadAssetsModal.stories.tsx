import { Meta, StoryObj } from '@storybook/react'
import React, { useEffect } from 'react'
import { WithListData } from '../../../../stories/helpers'
import { StorybookProviders } from '../../../../stories/StorybookProviders'
import { IAsset } from '../assets.types'
import { fetchAssets } from '../assets.api'
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
        {({ data }) => <DownloadAssetsModalWrapper data={data['assets']} />}
      </WithListData>
    )
  },
}

export default meta
