import { Link, NavLink } from "react-router-dom"
import styled, { css } from "styled-components"
import { Button } from "../../components/Button"
import { Svg } from "../../components/icons/Svg"
import { BackLink } from "../../components/Page/PageBackLink"
import { colors } from "../../styles/theme"


export const StyledBackLink = styled(BackLink)`
  margin: 16px 16px;
`

export const ScopePicker = styled.div`
  margin: 20px;
`

export const LoadingList = styled.span`
  font-size: 14px;
`

export const MenuText = styled.span`
  flex: 1 0 auto;

`
export const StyledMenuCounter = styled.span<{isLong?: boolean}>`
  height: 20px;
  min-width: 20px;
  line-height: 0;
  background-color: ${colors.inactiveBlue};
  border-radius: 10px;
  ${({ isLong }) => isLong && `padding: 0 2px;`}
  display: flex;
  justify-content: center;
  align-items: center;

  justify-self: flex-end;
  margin-right: 1rem;
  color: ${colors.white110};
  font-size: 12px;
`
export const MenuItem = styled(NavLink)`
  justify-self: normal;
  display: flex;
  align-items: center;
  height: 50px;
  padding-left: 20px;
  color: ${colors.textDarkGrey};
  &.active {
    background-color: #dfe9f8;
    &:hover {
      background-color: #dfe9f8;
    }
  }
  &:hover {
    background-color: #f1f6fd;
  }
  ${Svg} {
    margin-right: 10px;
  }
`


export const Row = styled.div`
  display: flex;
  align-items: stretch;
  flex: 1 1 auto;
  flex-direction: row;
  border-top: solid 1px #d5d5d5;
`
export const StyledMenu = styled.div<{ expanded: boolean }>`
  display: flex;
  flex-direction: column;

  ${({ expanded }) => expanded
    ? css`
      min-width: 270px;
      max-width: 270px;
      width: 270px;
    `
    : css`
      width: 70px;
      min-width: 70px;
      max-width: 70px;
    
      ${MenuText} {
        display: none;
      }
      
      ${MenuItem} {
        padding: 0;
        justify-content: center;
      }
    `
  }
  border-right: solid 1px #d5d5d5;
  overflow: none;
`
export const Main = styled.div`
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
  overflow: auto;
`
export const Expand = styled.div`
  display: flex;
  cursor: pointer;

  justify-content: center;
  justify-self: flex-end;
  background: #dfe9f8;
  color: ${colors.textDarkGrey};
`
export const Fill = styled.div`
  flex: 1 0 auto;
`

export const StyledHomeTable = styled.div`
  font-size: 14px;
`


export const QuickActions = styled.div`
  display: flex;
  ${Svg} {
    margin-right: 4px;
  }
  ${Button} {
    margin-right: 4px;
  }
`

export const StyledRight = styled.div`
  display: flex;
  gap: 8px;
`

export const StyledNameCell = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: ${colors.primaryBlue};

  ${Svg} {
    margin-right: 7px;
  }
`

export const StyledLinkCell = styled(Link)`
  display: flex;
  align-items: center;
  gap: 5px;
  ${Svg} {
    margin-top: 2px;
  }
`

export const ActionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 20px;
  gap: 8px;
`

