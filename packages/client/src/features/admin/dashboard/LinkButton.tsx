import styled from 'styled-components'
import React, { ReactNode } from 'react'
import { Link } from 'react-router'
import { Button } from '../../../components/Button'

const StyledLink = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: bold;
  white-space: nowrap;
  line-height: 1.428571429;
  color: var(--c-text-500);
`

const LinkButton = ({ to, nonReact, icon, label }: {to: string, nonReact?: boolean, icon?: ReactNode, label?: string}) => {

  if (nonReact) {
    return (
      <Button as="a" href={to}>
        <StyledLink>
          {icon}
          {label}
        </StyledLink>
      </Button>
    )
  }

  return (
    <Button as={Link} to={to}>
      <StyledLink>
        {icon}
        {label}
      </StyledLink>
    </Button>
  )
}

export default LinkButton
