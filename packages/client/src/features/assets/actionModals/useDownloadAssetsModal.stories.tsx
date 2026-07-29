import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect } from 'react'
import { mockSelectAssets } from '../../../mocks/handlers/assets.handlers'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import type { IAsset } from '../assets.types'
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

const assets = mockSelectAssets.map(asset => ({
  ...asset,
  links: {
    ...asset.links,
    show: `/home/assets/${asset.uid}`,
    download: asset.links.download ?? `/api/assets/${asset.uid}/download`,
  },
}))

const DownloadAssetsModalWrapper = (props: Props) => {
  const { modalComp, setShowModal } = useDownloadAssetsModal(props.data)

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])
  return modalComp
}

export const DownloadAssetsModal: Story = {
  render: () => <DownloadAssetsModalWrapper data={assets} />,
}

export default meta
