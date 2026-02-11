import { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect } from 'react'
import { WithListData } from '../../../stories/helpers'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import { fetchAssets } from '../assets.api'
import { IAsset } from '../assets.types'
import { useEditAssetModal } from './useEditAssetModal'

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
        {({ data }) => data && <EditAssetsModalWrapper data={data.assets[0]} />}
      </WithListData>
    )
  },
}

export default meta
