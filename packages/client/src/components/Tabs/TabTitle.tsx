import React from 'react'
import styled, { css } from 'styled-components'
import { colors } from '../../styles/theme'

const StyledTitleWrapper = styled.div`
  display: inline-block;
`

const StyledTitle = styled.a<{ $isActive: boolean }>`
  cursor: 'pointer';
  border-bottom: 3px solid;
  display: block;
  padding: 10px;
  margin: 3px;
  color: ${colors.textDarkGrey};
  border-bottom-color: ${colors.textWhite};
  ${({ $isActive }) => $isActive && css`
    color: ${colors.highlightBlue};
    border-bottom-color: ${colors.orange};
  `}
  &:hover {
    cursor: pointer;
    background-color: ${colors.subtleBlue};
    border-bottom-color: ${colors.textLightGrey};
  }
`

type Props = {
  title: string
  index: number
  setSelectedTab: (index: number) => void
  active: boolean
}

export const TabTitle: React.FC<Props> = ({ title, setSelectedTab, index, active }) => {

  const onClick = () => {
    setSelectedTab(index)
  }
  return (
    <StyledTitleWrapper onClick={onClick}>
      <StyledTitle $isActive={active}>{title}</StyledTitle>
    </StyledTitleWrapper>
  )
}