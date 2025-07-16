import React from 'react'
import { DropdownNext } from '../../../components/Dropdown/DropdownNext'
import { Li, Ol, StyledEditButton } from '../../discussions/styles'
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
      <DropdownNext
        placement="bottom-end"
        trigger="click"
        content={() => (
          <Ol>
            <Li onClick={() => setShowModal(true)}>Change Role</Li>
          </Ol>
        )}
      >
        {dropdownProps => (
          // @ts-expect-error ref is not compatible
          <StyledEditButton data-testid="member-edit-button" tabIndex={0} {...dropdownProps}>
            <ThreeDotsIcon width={16} />
          </StyledEditButton>
        )}
      </DropdownNext>
      {modalComp}
    </>
  )
}

export default MemberEditButton
