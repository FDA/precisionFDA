import React from 'react'
import { Link } from 'react-router'
import styled from 'styled-components'
import { ISpace } from '../spaces.types'
import MemberEditButton from './MemberEditButton'
import { getSpaceMembershipSideAlias, SpaceMembership } from './members.types'

const Card = styled.div<{ $isDeactivated: boolean }>`
  min-width: 300px;
  border: 1px solid var(--c-layout-border);
  border-radius: 6px;
  margin-bottom: 4px;
  display: flex;
  flex-direction: column;
`

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--c-layout-border);
  padding: 4px 8px 4px 4px;
  position: relative;

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

const UserInfo = styled.div<{ $isDeactivated: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  ${({ $isDeactivated }) => $isDeactivated && 'opacity: 0.7;'}
`

const StatusPill = styled.div<{ $active: boolean }>`
  border-radius: 7px;
  background-color: ${props => (props.$active ? 'var(--success-500)' : 'var(--warning-500)')};
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 2px 6px;
  display: inline-block;
`

const Details = styled.div<{ $isDeactivated: boolean }>`
  font-size: 14px;
  line-height: 22px;

  ul {
    list-style: none;
    padding: 8px;
    margin: 0;
  }

  li {
    display: flex;
    justify-content: space-between;
  }
  ${({ $isDeactivated }) => $isDeactivated && 'opacity: 0.7; color: var(--c-text-400);'}
`

const Label = styled.span`
  font-weight: bold;
`

type DetailItemProps = {
  label: string
  value: React.ReactNode
  isLink?: boolean
  username?: string
}

const DetailItem = ({ label, value, isLink = false, username = '' }: DetailItemProps) => (
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
  const isDeactivated = member.active === 'Inactive' || member.active === 'Account deactivated'

  return (
    <Card $isDeactivated={isDeactivated} data-testid="member-card">
      <CardHeader>
        <UserInfo $isDeactivated={isDeactivated}>
          <Link to={`/users/${member.user_name}`} target="_blank" rel="noopener noreferrer">
            {member.title}
          </Link>
          <StatusPill $active={member.active === 'Active'}>
            {member.active}
          </StatusPill>
        </UserInfo>
        {member.to_roles.length > 0 && <MemberEditButton spaceId={space.id} member={member} />}
      </CardHeader>
      <Details $isDeactivated={isDeactivated}>
        <ul>
          <DetailItem label="Username" value={member.user_name} isLink username={member.user_name} />
          <DetailItem label="Role" value={member.role} />
          <DetailItem label="Side" value={getSpaceMembershipSideAlias(member.side, space)} />
          <DetailItem label="Domain" value={member.domain} />
          <DetailItem label="Joined On" value={member.created_at} />
        </ul>
      </Details>
    </Card>
  )
}
