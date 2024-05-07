import styled from 'styled-components'
import React, { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { colors, fontSize, fontWeight } from '../../../styles/theme'

const StyledLink = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  color: ${colors.primaryBlue};
  background-color: ${colors.textWhite};
  font-weight: ${fontWeight.bold};
  border: 1px solid #daeffb;
  white-space: nowrap;
  font-size: ${fontSize.body};
  line-height: 1.428571429;
  border-radius: 3px;
  user-select: none;
  &:hover {
    background-color: ${colors.subtleBlue};
    border-color: ${colors.primaryBlue};
  }
`

const LinkButton = ({ to, nonReact, icon, label }: {to: string, nonReact?: boolean, icon?: ReactNode, label?: string}) => {

  if (nonReact) {
    return (
      <a href={to}>
        <StyledLink>
          {icon}
          {label}
        </StyledLink>
      </a>
    )
  }

  return (
    <Link to={to}>
      <StyledLink>
        {icon}
        {label}
      </StyledLink>
    </Link>
  )
}

export default LinkButton