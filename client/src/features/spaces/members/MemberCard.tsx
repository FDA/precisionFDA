import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { colors } from '../../../styles/theme'
import { SpaceMembership } from './members.types'
import { Button } from '../../../components/Button/index'
import { useChangeMemberRoleModal } from './useChangeMemberRoleModal'
import { Identicon } from '../../../components/Identicon'

export const StyledMemberCard = styled.div<{isDeactivated: boolean}>`
  min-width: 300px;
  border: 1px solid #cbcbcb;
  ${({ isDeactivated }) => isDeactivated && `border: 1px solid ${colors.borderDefault};;`}
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  border-radius: 6px;
`
export const StyledCardHeader = styled.div`
  border-bottom: 1px solid #cbcbcb;
  padding: 4px;

  a {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 14px;
    display: flex;
    line-height: 30px;
    cursor: pointer;
  }
`
export const Key = styled.span`
  font-weight: bold;
`
export const Value = styled.span``
export const Gravatar = styled.img`
  border-radius: 80%;
  vertical-align: middle;
  height: 30px;
  margin-right: 5px;
`
export const StyledDetails = styled.div<{isDeactivated: boolean}>`
  ${({ isDeactivated }) => isDeactivated && `color: ${colors.textDarkGreyInactive};`}
  font-size: 14px;
  line-height: 22px;
  ul {
    list-style: none;
    padding: 8px;
    margin: 0;
    li {
      display: flex;
      justify-content: space-between;
    }
  }
`

const RoleButton = styled(Button)`
  margin: 4px;
`

export function MemberCard({ member, spaceId }: { member: SpaceMembership, spaceId: string }) {
  const { modalComp, setShowModal } = useChangeMemberRoleModal({ spaceId, member })
  return (
    <StyledMemberCard isDeactivated={!member.active}>
      <StyledCardHeader>
        <Link
          to={`/users/${member.user_name}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Identicon dxuser={member.user_name} />
          {member.title}
        </Link>
      </StyledCardHeader>
      <StyledDetails isDeactivated={!member.active}>
        <ul>
          <li>
            <Key>Username:</Key>
            <Value>
              <Link
                to={`/users/${member.user_name}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {member.user_name}
              </Link>
            </Value>
          </li>
          <li>
            <Key>Role:</Key>
            <Value>{member.active ? member.role : `${member.role} (disabled)`}</Value>
          </li>
          <li>
            <Key>Organization:</Key>
            <Value>{member.org}</Value>
          </li>
          <li>
            <Key>Joined On:</Key>
            <Value>{member.created_at}</Value>
          </li>
        </ul>
        {member.to_roles.length > 0 && <><RoleButton onClick={() => setShowModal(true)}>Change Role</RoleButton>{modalComp}</>}
      </StyledDetails>
    </StyledMemberCard>
  )
}
