import type { Meta, StoryObj } from '@storybook/react-vite'
import { HttpResponse, http } from 'msw'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { spacesV2 } from '@/mocks/handlers/spaces.handlers'
import { StorybookProviders } from '@/stories/StorybookProviders'
import { useOpenModalInStory } from '@/stories/useOpenModalInStory'
import type { SpaceMembershipV2 } from '../../spaces/members/members.types'
import { useRecoverSpaceLeadModal } from './useRecoverSpaceLeadModal'

const memberships: SpaceMembershipV2[] = [
  {
    active: true,
    createdAt: '2026-08-01T12:00:00.000Z',
    id: 201,
    name: 'Ada Lovelace',
    role: 'LEAD',
    side: 'HOST',
    userActive: true,
    username: 'ada.lovelace',
  },
  {
    active: true,
    createdAt: '2026-08-02T12:00:00.000Z',
    id: 202,
    name: 'Grace Hopper',
    role: 'LEAD',
    side: 'GUEST',
    userActive: true,
    username: 'grace.hopper',
  },
  {
    active: false,
    createdAt: '2026-08-03T12:00:00.000Z',
    id: 203,
    name: 'Inactive Lead',
    role: 'LEAD',
    side: 'HOST',
    userActive: true,
    username: 'inactive.lead',
  },
]

const meta: Meta = {
  title: 'Modals/Admin/Spaces/Recover Space Lead',
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
        http.get('/api/v2/spaces/:spaceId/memberships', () => HttpResponse.json(memberships)),
        http.post('/api/v2/spaces/:spaceId/memberships/recover-lead', () => HttpResponse.json({ status: 'ok' })),
        http.get('/api/v2/users/me/cloud-resources', () =>
          HttpResponse.json({
            computeCharges: 0,
            totalCharges: 0,
            storageCharges: 0,
            dataEgressCharges: 0,
            usageLimit: 300,
            jobLimit: 100,
            usageAvailable: 300,
          }),
        ),
      ],
    },
  },
}

type Story = StoryObj

const RecoverSpaceLeadHarness = () => {
  const { modalComp, setShowModal } = useRecoverSpaceLeadModal({ space: spacesV2[2] })

  useOpenModalInStory(setShowModal)

  return modalComp
}

export const Default: Story = {
  render: () => <RecoverSpaceLeadHarness />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)

    const dialog = await body.findByRole('dialog', { name: 'Recover Space Lead' })
    const currentLead = await within(dialog).findByRole('combobox', { name: 'Current Lead user' })

    await userEvent.click(currentLead)
    await userEvent.click(await body.findByRole('option', { name: 'ada.lovelace (REVIEWER)' }))
    await waitFor(() => expect(currentLead).toHaveValue('ada.lovelace (REVIEWER)'))

    await userEvent.click(within(dialog).getByRole('textbox', { name: 'New Lead user' }))
  },
}

export default meta
