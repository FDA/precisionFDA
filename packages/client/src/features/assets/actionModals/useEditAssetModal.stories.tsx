import { Meta, StoryObj } from '@storybook/react'
import React, { useEffect } from 'react'
import { WithListData } from '../../../stories/helpers'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import { IAsset } from '../assets.types'
import { useEditAssetModal } from './useEditAssetModal'
import { fetchAssets } from '../assets.api'

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
  data: IAsset
}
type Story = StoryObj<Props>

const EditAssetsModalWrapper = (props: Props) => {
  const { modalComp, setShowModal } = useEditAssetModal(props.data)

  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const EditAssetsModal: Story = {
  render: () => {
    return (
      <WithListData resource="assets" fetchList={fetchAssets}>
        {({ data }) => <EditAssetsModalWrapper data={data['assets'][0]} />}
      </WithListData>
    )
  },
}

export default meta
