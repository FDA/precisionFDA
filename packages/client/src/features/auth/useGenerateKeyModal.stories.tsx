import type { Meta, StoryObj } from '@storybook/react-vite'
import { delay, HttpResponse, http } from 'msw'
import { expect, within } from 'storybook/test'
import { StorybookProviders } from '@/stories/StorybookProviders'
import { useOpenModalInStory } from '@/stories/useOpenModalInStory'
import { useGenerateKeyModal } from './useGenerateKeyModal'

const meta: Meta = {
  title: 'Modals/Auth/Generate Key',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}
type Story = StoryObj

const GenerateKeyModalHarness = () => {
  const { modalComp, setShowModal } = useGenerateKeyModal()
  useOpenModalInStory(setShowModal)
  return modalComp
}

export const Default: Story = {
  parameters: {
    msw: { handlers: [http.get('/api/auth_key', () => HttpResponse.json({ Key: 'pfda_abc123-example-cli-key' }))] },
  },
  render: () => <GenerateKeyModalHarness />,
}

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/auth_key', async () => {
          await delay('infinite')
          return HttpResponse.json({ Key: '' })
        }),
      ],
    },
  },
  render: () => <GenerateKeyModalHarness />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    await expect(await body.findByRole('button', { name: 'Copy to Clipboard' })).toBeDisabled()
  },
}

export default meta
