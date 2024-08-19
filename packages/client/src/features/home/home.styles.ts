import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { NavLink } from '../../components/NavLink'
import { BackLink } from '../../components/Page/PageBackLink'
import { compactScrollBarV2 } from '../../components/Page/styles'
import { Svg } from '../../components/icons/Svg'
import { fontWeight } from '../../styles/theme'

export const StyledBackLink = styled(BackLink)`
  margin: 16px 16px;
`

export const MenuText = styled.span`
  flex: 1 0 auto;
  font-size: 14px;
  font-weight: ${fontWeight.bold};
`

export const MenuItem = styled(NavLink)`
  justify-self: normal;
  display: flex;
  align-items: center;
  min-height: 44px;
  padding-left: 20px;
  color: var(--c-text-700);
  font-weight: 400;
  &.active {
    color: white;
    background-color: var(--primary-500);
    &:hover {
      color: white;
      background-color: var(--primary-500);
    }
  }
  &:hover {
    color: var(--c-text-700);
    background-color: var(--tertiary-100);
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

export const Expand = styled.div`
  position: relative;
  padding-right: 24px;
  padding-bottom: 16px;
  display: flex;
  cursor: pointer;
  justify-content: flex-end;
  justify-self: flex-end;

  svg:hover {
    color: var(--tertiary-500);
  }
`

export const StyledMenu = styled.div<{ $expanded: boolean }>`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  ${({ $expanded }) =>
    $expanded
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
        `}
  border-right: solid 1px var(--c-layout-border);
  overflow: none;
`
export const Main = styled.div`
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-direction: column;
  ${compactScrollBarV2}
`
export const Fill = styled.div`
  flex: 1 0 auto;
  min-height: 20px;
`

export const StyledHomeTable = styled.div`
  overflow-y: auto;
  font-size: 14px;
  flex: 1;
  ${compactScrollBarV2}
`

export const QuickActions = styled.div`
  display: flex;
  gap: 4px;
  margin-right: 16px;
  ${Svg} {
    margin-right: 4px;
  }
`

export const SpaceTitle = styled.div`
  margin: 0;
  font-size: 24px;
  font-weight: bolder;
`

export const StyledRight = styled.div`
  display: flex;
  gap: 8px;
`

export const StyledNameCell = styled.div<{ color?: string }>`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--c-link);

  ${({ color }) =>
    color &&
    css`
      color: ${color};
    `}

  ${Svg} {
    margin-right: 7px;
    width: 15px;
  }
  min-width: max-content;
`

export const StyledLink = styled(Link)<{ disable?: boolean }>`
  ${({ disable }) =>
    disable &&
    css`
      pointer-events: none;
      color: var(--c-text-400);
    `}
`

export const StyledLinkCell = styled(StyledLink)`
  width: min-content;
  display: flex;
  align-items: center;
  gap: 5px;
  ${Svg} {
    margin-top: 2px;
    min-width: 14px;
  }
`

export const ActionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
  gap: 8px;
`

export const StyledBreadcrumbs = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`
export const StyledRunByYouLink = styled.a`
  font-size: 12px;
`

export const StyledForm = styled.form``
