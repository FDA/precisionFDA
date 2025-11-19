import React from 'react'
import Menu from '../../../components/Menu/Menu'
import { StyledEditButton } from '../../discussions/styles'
import { ThreeDotsIcon } from '../../../components/icons/ThreeDotsIcon'
import { useChangeMemberRoleModal } from './useChangeMemberRoleModal'
import { SpaceMembership } from './members.types'

interface MemberEditButtonProps {
  member: SpaceMembership
  spaceId: number
}

const MemberEditButton: React.FC<MemberEditButtonProps> = ({
  member,
  spaceId,
}) => {
  const { modalComp, setShowModal } = useChangeMemberRoleModal({
    spaceId,
    member,
  })
  return (
    <>
      <Menu
        trigger={
          <Menu.Trigger>
            <StyledEditButton data-testid="member-edit-button" tabIndex={0}>
              <ThreeDotsIcon width={16} />
            </StyledEditButton>
          </Menu.Trigger>
        }
      >
        <Menu.Item onClick={() => setShowModal(true)}>Change Role</Menu.Item>
      </Menu>
      {modalComp}
    </>
  )
}

export default MemberEditButton
