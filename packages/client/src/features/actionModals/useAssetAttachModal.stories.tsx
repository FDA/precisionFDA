import { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { Asset } from './AttachToModal/useListAssetsQuery'
import { useAssetAttachModal } from './useAssetAttachModal'

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
  initialAssets?: Asset[]
}

type Story = StoryObj<Props>

const AssetAttachModalWrapper = ({ initialAssets = [] }: Props) => {
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>(initialAssets)
  const { modalComp, setShowModal } = useAssetAttachModal(selectedAssets, setSelectedAssets)

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return (
    <div>
      {modalComp}
      <div style={{ padding: '20px', marginTop: '20px' }}>
        <h3>Selected Assets ({selectedAssets.length}):</h3>
        <ul>
          {selectedAssets.map(asset => (
            <li key={asset.uid}>
              <strong>{asset.title}</strong> - {asset.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export const AssetAttachModal: Story = {
  render: ({ initialAssets }) => {
    return <AssetAttachModalWrapper initialAssets={initialAssets} />
  },
  args: {
    initialAssets: [],
  },
}

export default meta
