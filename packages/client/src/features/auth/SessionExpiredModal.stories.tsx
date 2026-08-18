import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { StorybookProviders } from '@/stories/StorybookProviders'
import { useOpenModalInStory } from '@/stories/useOpenModalInStory'
import { useModal } from '../modal/useModal'
import { SessionExpiredModal } from './SessionExpiredModal'

const meta: Meta = {
  title: 'Modals/Auth/Session Expired',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}
type Story = StoryObj

const SessionExpiredModalHarness = () => {
  const modal = useModal()
  useOpenModalInStory(modal.setShowModal)
  return <SessionExpiredModal {...modal} />
}

export const Default: Story = {
  render: () => <SessionExpiredModalHarness />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    const dialog = await body.findByRole('dialog', { name: 'Session Expired' })
    const overlay = canvasElement.ownerDocument.querySelector<HTMLElement>('[data-slot="dialog-overlay"]')

    await expect(overlay).toHaveClass('supports-backdrop-filter:backdrop-blur-[6px]')
    await userEvent.keyboard('{Escape}')
    await expect(dialog).toBeVisible()
    await expect(body.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    if (overlay) await userEvent.click(overlay)
    await expect(dialog).toBeVisible()
  },
}

export default meta
