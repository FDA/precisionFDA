import { Link, NavLink } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { Button } from '../../components/Button'
import { Svg } from '../../components/icons/Svg'
import { BackLink } from '../../components/Page/PageBackLink'
import { MainBanner } from '../../components/Banner'
import { commonStyles } from '../../styles/commonStyles'
import { colors, padding, sizing, fontSize, fontWeight } from '../../styles/theme'
import { compactScrollBar } from '../../components/Page/styles'


export const StyledBackLink = styled(BackLink)`
  margin: 16px 16px;
`

export const LoadingList = styled.span`
  font-size: 14px;
`

export const MenuText = styled.span`
  flex: 1 0 auto;
  font-size: 16px;
  font-weight: ${fontWeight.bold};
`

export const HomeBanner = styled(MainBanner)`
  display: flex;
  flex-flow: row nowrap;
  padding: 18px ${padding.mainContentHorizontal};
  margin: 0 auto;

  @media (max-width: 640px) {
    flex-flow: column wrap;
  }
`

export const HomeTitle = styled.h1`
  ${commonStyles.bannerTitle}
  color: ${colors.textWhite};
  margin: auto 0;
  width: 228px;
`

export const ScopeDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const ScopePicker = styled.div`
  display: flex;
  gap: 48px;
  padding: 0 0 6px 0;
  margin: 0;
`

export const ScopePickerItem = styled(Button)<{ active?: boolean }>`
  display: inline-block;
  font-weight: ${fontWeight.medium};
  font-size: ${fontSize.h2};
  line-height: 20px;
  color: ${colors.textWhite};
  background: transparent;
  letter-spacing: 0;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 0;
  border-bottom: ${sizing.highlightBarWidth} solid transparent;
  cursor: pointer;

  &:hover {
    background: transparent;
    border-bottom: ${sizing.highlightBarWidth} solid ${colors.blueOnBlack};
    color: ${colors.textWhite};
  }

  ${({ active }) => (
    active && css`
      color: ${colors.blueOnBlack};
      border-bottom: ${sizing.highlightBarWidth} solid ${colors.blueOnBlack};

      &:hover {
        color: ${colors.blueOnBlack};
      }
    `
  )}
`

export const ScopeDescription = styled.span`
  color: ${colors.textWhite};
  font-size: 13px;
`

export const MenuItem = styled(NavLink)`
  justify-self: normal;
  display: flex;
  align-items: center;
  height: 50px;
  padding-left: 20px;
  color: ${colors.textDarkGrey};
  font-weight: 400;
  &.active {
    color: ${colors.textWhite};
    background-color: ${colors.primaryBlue};
    &:hover {
      color: ${colors.textWhite};
      background-color: ${colors.primaryBlue};
    }
  }
  &:hover {
    color: ${colors.textDarkGrey};
    background-color: ${colors.subtleBlue};
  }
  ${Svg} {
    margin: auto 0px;
    width: 32px;
  }
`


export const Row = styled.div`
  display: flex;
  align-items: stretch;
  flex: 1 1 auto;
  flex-direction: row;
  height: 0;
`
export const StyledMenu = styled.div<{ expanded: boolean }>`
  display: flex;
  flex-direction: column;

  ${({ expanded }) => expanded
    ? css`
      min-width: 228px;
      max-width: 228px;
      width: 228px;
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
      ${Expand} {
        justify-content: center;
        padding: 18px 0;
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
  display: flex;
  flex-direction: column;
  ${compactScrollBar}
`
export const Expand = styled.div`
  position: relative;
  padding-right: 24px;
  padding-bottom: 16px;
  display: flex;
  cursor: pointer;
  justify-content: flex-end;
  justify-self: flex-end;
  color: ${colors.textDarkGrey};
  svg:hover {
    color: ${colors.textMediumGrey};
  }
`
export const Fill = styled.div`
  flex: 1 0 auto;
`

export const StyledHomeTable = styled.div`
  overflow-y: auto;
  font-size: 14px;
  flex: 1;
  ${compactScrollBar}
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

export const StyledNameCell = styled.div<{ color?: string }>`
  display: flex;
  flex-grow: 1;
  align-items: center;
  cursor: pointer;
  color: ${colors.primaryBlue};
  
  ${({ color }) =>
    color && css`
      color: ${color};  
    `
  }

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
export const StyledRunByYouLink = styled.a`
  font-size: 12px;
`
