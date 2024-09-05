import React, { ReactElement } from 'react'
import styled, { css } from 'styled-components'
import { colors } from '../../styles/theme'

const StyledTitleWrapper = styled.div`
  display: inline-block;
`

const StyledTitle = styled.div<{ $isActive: boolean }>`
  cursor: 'pointer';
  display: block;
  padding: 10px;
  color: ${colors.textDarkGrey};
  border-bottom-color: ${colors.textWhite};
  background-color: ${colors.textWhite};
  ${({ $isActive }) => $isActive && css`
  color: ${colors.highlightBlue};
    background-color: ${colors.subtleBlue};
  `}
  &:hover {
    cursor: pointer;
    background-color: ${colors.subtleBlue};
  }
`

type Props = {
  title: ReactElement
  index: number
  setSelectedTab: (index: number) => void
  active: boolean
}

export const SideTabTitle: React.FC<Props> = ({ title, setSelectedTab, index, active }) => {
  const onClick = () => {
    setSelectedTab(index)
  }

  return (
    <StyledTitleWrapper onClick={onClick}>
      <StyledTitle $isActive={active}> {title}</StyledTitle>
    </StyledTitleWrapper>
  )
}