import { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect } from 'react'
import { mockMembers } from '../../../mocks/handlers/spaces.handlers'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import { MemberRole, SpaceMembership } from './members.types'
import { useAddMembersModal } from './useAddMembersModal'
import { useChangeMemberRoleModal } from './useChangeMemberRoleModal'

const meta: Meta = {
  title: 'Modals/Spaces',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

type AddMembersProps = {
  spaceType: 'verification' | 'groups' | 'review'
}
type AddMembersStory = StoryObj<AddMembersProps>

const AddMembersModalWrapper = ({ spaceType }: AddMembersProps) => {
  const spaceId =
    spaceType === 'verification' ? 'space-verification-123' : spaceType === 'review' ? 'space-review-456' : 'space-groups-789'

  const { modalComp, setShowModal } = useAddMembersModal({ spaceId })

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return modalComp
}

export const AddMembersModal: AddMembersStory = {
  render: ({ spaceType = 'verification' }) => {
    return <AddMembersModalWrapper spaceType={spaceType} />
  },
  argTypes: {
    spaceType: {
      options: ['verification', 'groups', 'review'],
      control: { type: 'radio' },
    },
  },
}

type ChangeMemberRoleProps = {
  memberRole: MemberRole
  memberSide: 'host' | 'guest'
}
type ChangeMemberRoleStory = StoryObj<ChangeMemberRoleProps>

const ChangeMemberRoleModalWrapper = ({ memberRole, memberSide }: ChangeMemberRoleProps) => {
  const member: SpaceMembership = {
    ...mockMembers[0],
    role: memberRole,
    side: memberSide,
  }

  const { modalComp, setShowModal } = useChangeMemberRoleModal({
    spaceId: 123,
    member,
  })

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return modalComp
}

export const ChangeMemberRoleModal: ChangeMemberRoleStory = {
  render: ({ memberRole = 'contributor', memberSide = 'host' }) => {
    return <ChangeMemberRoleModalWrapper memberRole={memberRole} memberSide={memberSide} />
  },
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
