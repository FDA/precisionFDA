import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { mockSelectAssets } from '@/mocks/handlers/assets.handlers'
import { StorybookProviders } from '@/stories/StorybookProviders'
import { useOpenModalInStory } from '@/stories/useOpenModalInStory'
import type { IAsset } from '../assets.types'
import { useEditAssetModal } from './useEditAssetModal'

const meta: Meta = {
  title: 'Modals/Assets/Edit Asset',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}
type Story = StoryObj

const asset: IAsset = {
  ...mockSelectAssets[0],
  name: 'GRCh38 reference bundle.tar.gz',
  origin: { text: 'GRCh38 reference bundle' },
}

const EditAssetModalHarness = () => {
  const { modalComp, setShowModal } = useEditAssetModal(asset)

  useOpenModalInStory(setShowModal)
  return modalComp
}

export const Default: Story = {
  render: () => <EditAssetModalHarness />,
}

export const Validation: Story = {
  render: () => <EditAssetModalHarness />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    const nameInput = await body.findByRole('textbox', { name: 'Asset Name' })

    await userEvent.clear(nameInput)
    await userEvent.click(body.getByRole('button', { name: 'Edit' }))

    await waitFor(() => expect(nameInput).toHaveAttribute('aria-invalid', 'true'))
    await expect(body.getByRole('alert')).toHaveTextContent('Name is required.')
  },
}

export default meta
