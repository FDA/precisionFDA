import React from 'react'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { Identicon } from '../../../components/Identicon'
import MemberEditButton from './MemberEditButton'
import { SpaceMembership } from './members.types'

export const StyledMemberCard = styled.div<{ $isDeactivated: boolean }>`
  --c-border: var(--c-layout-border);

  min-width: 300px;
  border: 1px solid var(--c-border);
  ${({ $isDeactivated }) =>
    $isDeactivated && css`border: 1px solid var(--c-border);`}
  margin-bottom: 4px;
  display: flex;
  flex-direction: column;
  border-radius: 6px;
`
export const StyledCardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--c-border);
    padding: 4px 8px 4px 4px;

    a {
        display: flex;
        gap: 8px;
        align-items: center;
        font-size: 14px;
        line-height: 30px;
        cursor: pointer;
    }
`
export const Key = styled.span`
  font-weight: bold;
`
export const Value = styled.span``
export const StyledDetails = styled.div<{ $isDeactivated: boolean }>`
  ${({ $isDeactivated }) =>
    $isDeactivated && css`color: var(--c-text-400);`}
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

export function MemberCard({
  member,
  spaceId,
}: {
  member: SpaceMembership
  spaceId: number
}) {
  return (
    <StyledMemberCard $isDeactivated={!member.active}>
      <StyledCardHeader>
        <Link
          to={`/users/${member.user_name}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Identicon dxuser={member.user_name} />
          {member.title}
        </Link>
        {member.to_roles.length > 0 && (
          <MemberEditButton spaceId={spaceId} member={member} />
        )}
      </StyledCardHeader>
      <StyledDetails $isDeactivated={!member.active}>
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
            <Value>
              {member.active ? member.role : `${member.role} (disabled)`}
            </Value>
          </li>
          <li>
            <Key>Organization:</Key>
            <Value>{member.org}</Value>
          </li>
          <li>
            <Key>Domain:</Key>
            <Value>{member.domain}</Value>
          </li>
          <li>
            <Key>Joined On:</Key>
            <Value>{member.created_at}</Value>
          </li>
        </ul>
      </StyledDetails>
    </StyledMemberCard>
  )
}
