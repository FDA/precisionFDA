import { describe, expect, test } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from '@/test/test-utils'
import { useModal } from '../modal/useModal'
import { AuthPickerModal } from './AuthPickerModal'
import { ExpiringSessionModal } from './ExpiringSessionModal'
import { SessionExpiredModal } from './SessionExpiredModal'

const OpenSessionExpiredModal = () => {
  const modal = useModal(true)
  return <SessionExpiredModal {...modal} />
}

const modal = {
  isShown: true,
  setShowModal: () => {},
  toggle: () => {},
}

const nonDismissibleDialogs = [
  {
    name: 'Auth Picker',
    accessibleName: 'Access to this page requires login',
    renderDialog: () => <AuthPickerModal />,
  },
  {
    name: 'Expiring Session',
    accessibleName: 'Session Expiring',
    renderDialog: () => <ExpiringSessionModal modal={modal} />,
  },
  {
    name: 'Session Expired',
    accessibleName: 'Session Expired',
    renderDialog: () => <OpenSessionExpiredModal />,
  },
]

describe.each(nonDismissibleDialogs)('$name dialog', ({ accessibleName, renderDialog }) => {
  test('does not close on Escape or backdrop click', async () => {
    document.cookie = `sessionExpiredAt=${Math.floor(Date.now() / 1000) + 45}; path=/`
    const screen = render(renderDialog())
    const dialog = screen.getByRole('dialog', { name: accessibleName })

    await expect.element(dialog).toBeVisible()

    await userEvent.keyboard('{Escape}')
    await expect.element(dialog).toBeVisible()

    const overlay = document.querySelector<HTMLElement>('[data-slot="dialog-overlay"]')
    expect(overlay).not.toBeNull()
    // Click the overlay's top-left corner; its center is covered by the centered dialog content.
    await userEvent.click(overlay!, { position: { x: 5, y: 5 } })
    await expect.element(dialog).toBeVisible()
  })
})
