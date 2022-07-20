import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { colors } from '../../../styles/theme'
import { SpaceMembership } from './members.types'

export const StyledMemberCard = styled.div`
  min-width: 300px;
  border: 2px solid ${colors.primaryBlue};
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`
export const StyledCardHeader = styled.div`
  background-color: ${colors.subtleBlue};
  padding: 4px;

  a {
    display: flex;
    align-items: center;
    color: ${colors.primaryBlue};
    font-size: 20px;
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
export const StyledDetails = styled.div`
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

export function MemberCard({ member }: { member: SpaceMembership }) {
  return (
    <StyledMemberCard>
      <StyledCardHeader>
        <Link
          to={`/users/${member.user_name}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Gravatar src={member.links.gravatar} />
          {member.title}
        </Link>
      </StyledCardHeader>
      <StyledDetails>
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
            <Value>{member.role}</Value>
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
      </StyledDetails>
    </StyledMemberCard>
  )
}
