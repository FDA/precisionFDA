import React, { FC } from 'react'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { ArrowLeftIcon } from '../icons/ArrowLeftIcon'

const backStyles = css`
  font-size: 14px;
  font-weight: bold;
  text-decoration: none;
  display: flex;
  align-items: center;
  width: fit-content;
`
export const StyledBackLink = styled(Link)`
  ${backStyles}
`
export const StyledBackButton = styled.button`
  ${backStyles}
`

export const BackLink: FC<{ linkTo: string, onClick?: (e: any) => void}> = ({ linkTo, children, onClick, ...rest }) => {
  if(onClick) return <StyledBackButton {...rest} onClick={onClick}><ArrowLeftIcon />&nbsp;{children}</StyledBackButton>
  return (
    <StyledBackLink {...rest} to={linkTo}>
      <ArrowLeftIcon />&nbsp;
      {children}
    </StyledBackLink>
  )
}

export const BackLinkMargin = styled(BackLink)`
  margin: 16px;
`
