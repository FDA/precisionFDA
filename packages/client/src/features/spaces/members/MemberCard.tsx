import React from 'react'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import MemberEditButton from './MemberEditButton'
import { getSpaceMembershipSideAlias, SpaceMembership } from './members.types'
import { ISpace } from '../spaces.types'

const deactivatedStyles = css`
  color: var(--c-text-400);
  border: 1px solid var(--c-border);
`

const Card = styled.div<{ $isDeactivated: boolean }>`
  min-width: 300px;
  border: 1px solid var(--c-layout-border);
  border-radius: 6px;
  margin-bottom: 4px;
  display: flex;
  flex-direction: column;
  ${({ $isDeactivated }) => $isDeactivated && deactivatedStyles}
`

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--c-layout-border);
  padding: 4px 8px 4px 4px;

  a {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 14px;
    line-height: 30px;
    cursor: pointer;
    font-weight: bold;
  }
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const Details = styled.div<{ $isDeactivated: boolean }>`
  font-size: 14px;
  line-height: 22px;
  ${({ $isDeactivated }) =>
    $isDeactivated &&
    css`
      color: var(--c-text-400);
    `}

  ul {
    list-style: none;
    padding: 8px;
    margin: 0;
  }

  li {
    display: flex;
    justify-content: space-between;
  }
`

const Label = styled.span`
  font-weight: bold;
`

const DetailItem = ({ label, value, isLink = false, username = '' }) => (
  <li>
    <Label>{label}:</Label>
    {isLink ? (
      <Link to={`/users/${username}`} target="_blank" rel="noopener noreferrer">
        {value}
      </Link>
    ) : (
      <span>{value}</span>
    )}
  </li>
)

export function MemberCard({ member, space }: { member: SpaceMembership; space: ISpace }) {
  const isDeactivated = !member.active
  const role = isDeactivated ? `${member.role} (disabled)` : member.role

  return (
    <Card $isDeactivated={isDeactivated} data-testid="member-card">
      <CardHeader>
        <UserInfo>
          <Link to={`/users/${member.user_name}`} target="_blank" rel="noopener noreferrer">
            {member.title}
          </Link>
        </UserInfo>
        {member.to_roles.length > 0 && <MemberEditButton spaceId={space.id} member={member} />}
      </CardHeader>
      <Details $isDeactivated={isDeactivated}>
        <ul>
          <DetailItem label="Username" value={member.user_name} isLink username={member.user_name} />
          <DetailItem label="Role" value={role} />
          <DetailItem label="Side" value={getSpaceMembershipSideAlias(member.side, space)} />
          <DetailItem label="Domain" value={member.domain} />
          <DetailItem label="Joined On" value={member.created_at} />
        </ul>
      </Details>
    </Card>
  )
}
