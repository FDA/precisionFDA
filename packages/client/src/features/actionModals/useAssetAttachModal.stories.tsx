import type { Meta, StoryObj } from '@storybook/react-vite'
import { HttpResponse, http } from 'msw'
import { useEffect, useState } from 'react'
import { StorybookProviders } from '@/stories/StorybookProviders'
import { mockAttachAssets } from '../../mocks/handlers/assets.handlers'
import type { Asset } from './AttachToModal/useListAssetsQuery'
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
      <div className="bg-background text-foreground mt-5 rounded-md border border-border p-5">
        <h3 className="mb-2 text-sm font-semibold">Selected Assets ({selectedAssets.length}):</h3>
        {selectedAssets.length === 0 ? (
          <p className="text-muted-foreground text-sm">No assets selected yet.</p>
        ) : (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {selectedAssets.map(asset => (
              <li key={asset.uid}>
                <strong>{asset.title}</strong> — {asset.description}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export const AssetAttachModal: Story = {
  parameters: {
    msw: {
      handlers: [http.post('/api/list_assets', () => HttpResponse.json(mockAttachAssets))],
    },
  },
  render: ({ initialAssets }) => <AssetAttachModalWrapper initialAssets={initialAssets} />,
  args: {
    initialAssets: [],
  },
}

export default meta
