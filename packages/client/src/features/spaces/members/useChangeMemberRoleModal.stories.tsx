import type { Meta, StoryObj } from '@storybook/react-vite'
import { useOpenModalInStory } from '@/stories/useOpenModalInStory'
import { mockMembers } from '../../../mocks/handlers/spaces.handlers'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import type { MemberRole, SpaceMembership } from './members.types'
import { useChangeMemberRoleModal } from './useChangeMemberRoleModal'

const meta: Meta = {
  title: 'Modals/Spaces/Members/Change Member Role',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

type Props = {
  memberRole: MemberRole
  memberSide: 'host' | 'guest'
}

type Story = StoryObj<Props>

const ChangeMemberRoleModalHarness = ({ memberRole, memberSide }: Props) => {
  const member: SpaceMembership = {
    ...mockMembers[0],
    role: memberRole,
    side: memberSide,
  }

  const { modalComp, setShowModal } = useChangeMemberRoleModal({ spaceId: 123, member })

  useOpenModalInStory(setShowModal)

  return modalComp
}

export const Default: Story = {
  render: ({ memberRole = 'contributor', memberSide = 'host' }) => (
    <ChangeMemberRoleModalHarness memberRole={memberRole} memberSide={memberSide} />
  ),
  argTypes: {
    memberRole: {
      options: ['contributor', 'viewer', 'admin', 'lead'] as MemberRole[],
      control: { type: 'radio' },
    },
    memberSide: {
      options: ['host', 'guest'],
      control: { type: 'radio' },
    },
  },
}

export default meta
