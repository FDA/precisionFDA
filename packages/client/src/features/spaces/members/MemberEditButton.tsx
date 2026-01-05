import React from 'react'
import { ThreeDotsIcon } from '../../../components/icons/ThreeDotsIcon'
import Menu from '../../../components/Menu/Menu'
import { StyledEditButton } from '../../discussions/styles'
import { SpaceMembership } from './members.types'
import { useChangeMemberRoleModal } from './useChangeMemberRoleModal'

interface MemberEditButtonProps {
  member: SpaceMembership
  spaceId: number
}

const MemberEditButton: React.FC<MemberEditButtonProps> = ({ member, spaceId }) => {
  const { modalComp, setShowModal } = useChangeMemberRoleModal({
    spaceId,
    member,
  })
  return (
    <>
      <Menu
        trigger={
          <StyledEditButton as={Menu.Trigger} data-testid="member-edit-button" tabIndex={0}>
            <ThreeDotsIcon width={16} />
          </StyledEditButton>
        }
      >
        <Menu.Item onClick={() => setShowModal(true)}>Change Role</Menu.Item>
      </Menu>
      {modalComp}
    </>
  )
}

export default MemberEditButton
