import type { Meta, StoryObj } from '@storybook/react-vite'
import { HttpResponse, http } from 'msw'
import { expect, userEvent, within } from 'storybook/test'
import { StorybookProviders } from '@/stories/StorybookProviders'
import { AuthPickerModal } from './AuthPickerModal'
import type { SiteSettingsResponse } from './useSiteSettingsQuery'

const siteSettings = (ssoEnabled: boolean): SiteSettingsResponse => ({
  ssoButton: ssoEnabled
    ? {
        isEnabled: true,
        data: { ssoUrl: 'https://sso.example.test/login?redirect_uri=https%3A%2F%2Fprecision.fda.gov' },
      }
    : { isEnabled: false },
  cdmh: { isEnabled: false },
  alerts: [],
  dataPortals: {},
})

const meta: Meta = {
  title: 'Modals/Auth/Auth Picker',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}
type Story = StoryObj

export const Default: Story = {
  parameters: {
    msw: { handlers: [http.get('/api/v2/site-settings', () => HttpResponse.json(siteSettings(false)))] },
  },
  render: () => <AuthPickerModal />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    const dialog = await body.findByRole('dialog', { name: 'Access to this page requires login' })
    const overlay = canvasElement.ownerDocument.querySelector<HTMLElement>('[data-slot="dialog-overlay"]')

    await expect(overlay).toHaveClass('supports-backdrop-filter:backdrop-blur-[6px]')
    await userEvent.keyboard('{Escape}')
    await expect(dialog).toBeVisible()
    await expect(body.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    if (overlay) await userEvent.click(overlay)
    await expect(dialog).toBeVisible()
  },
}

export const WithSso: Story = {
  parameters: {
    msw: { handlers: [http.get('/api/v2/site-settings', () => HttpResponse.json(siteSettings(true)))] },
  },
  render: () => <AuthPickerModal />,
}

export default meta
