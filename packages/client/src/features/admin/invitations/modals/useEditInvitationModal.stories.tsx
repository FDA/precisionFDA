import type { Meta, StoryObj } from '@storybook/react-vite'
import { HttpResponse, http } from 'msw'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { StorybookProviders } from '@/stories/StorybookProviders'
import { useOpenModalInStory } from '@/stories/useOpenModalInStory'
import type { Invitation } from '../../users/api'
import { useEditInvitationModal } from './useEditInvitationModal'

const invitation: Invitation = {
  id: 42,
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada.lovelace@fda.gov',
  duns: '123456789',
  provisioningState: 'pending',
  createdAt: '2026-08-01T12:00:00.000Z',
  updatedAt: '2026-08-01T12:00:00.000Z',
}

const meta: Meta = {
  title: 'Modals/Admin/Invitations/Edit Invitation',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
  parameters: {
    msw: {
      handlers: [http.put('/api/v2/admin/invitations/:id', () => HttpResponse.json(invitation))],
    },
  },
}

type Story = StoryObj

const EditInvitationHarness = () => {
  const { modalComp, setShowModal } = useEditInvitationModal(invitation)

  useOpenModalInStory(setShowModal)

  return modalComp
}

export const Default: Story = {
  render: () => <EditInvitationHarness />,
}

export const Validation: Story = {
  render: () => <EditInvitationHarness />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    const firstName = await body.findByRole('textbox', { name: 'First Name' })
    const lastName = body.getByRole('textbox', { name: 'Last Name' })
    const email = body.getByRole('textbox', { name: 'Email' })

    await userEvent.clear(firstName)
    await userEvent.clear(lastName)
    await userEvent.clear(email)
    await userEvent.click(body.getByRole('button', { name: 'Edit' }))

    await waitFor(() => expect(firstName).toHaveAttribute('aria-invalid', 'true'))
    await expect(lastName).toHaveAttribute('aria-invalid', 'true')
    await expect(email).toHaveAttribute('aria-invalid', 'true')
  },
}

export default meta
