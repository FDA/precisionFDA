import type { Meta, StoryObj } from '@storybook/react-vite'
import type { RowSelectionState } from '@tanstack/react-table'
import { delay, HttpResponse, http } from 'msw'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { StorybookProviders } from '@/stories/StorybookProviders'
import { useOpenModalInStory } from '@/stories/useOpenModalInStory'
import type { Invitation } from '../../users/api'
import { useProvisioningModal } from './useProvisioningModal'

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

const fdaSpaceGroup = {
  id: 1,
  name: 'FDA Portals',
  description: 'Portals available during FDA user provisioning.',
  spaces: [
    { id: 101, name: 'Genomics Portal', type: 'groups', isActiveMember: true },
    { id: 102, name: 'Regulatory Science Portal', type: 'groups', isActiveMember: true },
    { id: 103, name: 'Medical Devices Portal', type: 'groups', isActiveMember: true },
  ],
}

const cloudResourcesHandler = http.get('/api/v2/users/me/cloud-resources', () =>
  HttpResponse.json({
    computeCharges: 0,
    totalCharges: 0,
    storageCharges: 0,
    dataEgressCharges: 0,
    usageLimit: 300,
    jobLimit: 100,
    usageAvailable: 300,
  }),
)

const meta: Meta = {
  title: 'Modals/Admin/Invitations/Provisioning',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v2/admin/fda-space-group', () => HttpResponse.json(fdaSpaceGroup)),
        http.post('/api/v2/admin/users/provision', () => HttpResponse.json({ status: 'started' })),
        cloudResourcesHandler,
      ],
    },
  },
}

type Story = StoryObj

const ProvisioningHarness = () => {
  const [, setSelectedIndexes] = useState<RowSelectionState>({ 0: true })
  const { modalComp, setShowModal } = useProvisioningModal([invitation], setSelectedIndexes)

  useOpenModalInStory(setShowModal)

  return modalComp
}

export const Default: Story = {
  render: () => <ProvisioningHarness />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)

    await expect(await body.findByText('3 of 3 selected')).toBeVisible()
    await userEvent.click(body.getByRole('button', { name: 'Clear All' }))
    await waitFor(() => expect(body.getByText('0 of 3 selected')).toBeVisible())
    await userEvent.click(body.getByText('Genomics Portal'))
    await waitFor(() => expect(body.getByText('1 of 3 selected')).toBeVisible())
  },
}

export const Loading: Story = {
  render: () => <ProvisioningHarness />,
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v2/admin/fda-space-group', async () => {
          await delay(60_000)
          return HttpResponse.json(fdaSpaceGroup)
        }),
        cloudResourcesHandler,
      ],
    },
  },
}

export default meta
