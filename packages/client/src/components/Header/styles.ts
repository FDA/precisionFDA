import styled, { css } from 'styled-components'
import { theme } from '../../styles/theme'
import { PFDALogoLight } from '../NavigationBar/PFDALogo'
import { Svg } from '../icons/Svg'
import { compactScrollBarV2 } from '../Page/styles'
import { TransparentButton } from '../Button'
import { StyledDropdown } from '../Dropdown'

const bpSmall = '@media(min-width: 850px)'
const bpMedium = '@media(min-width: 1045px)'
const bpLarge = '@media(min-width: 1200px)'
const bpSuper = '@media(min-width: 1340px)'

export const MenuButton = styled(TransparentButton)<{$active: boolean}>`
  padding: 8px;
  transition: 0.1s ease-in-out;
  transition-property: background-color, color;
  &:hover {
    background-color: var(--c-app-header-bg-hover);
    color: var(--c-app-header-menu-hover);
  }
  ${({ $active }) => $active && css`
    background-color: var(--c-app-header-bg-hover);
    color: var(--c-app-header-menu-hover);
  `}
`

export const StyledHeaderLogo = styled(PFDALogoLight)`
  box-sizing: border-box;
  padding: 4px 0;
  min-width: 143.98px;
`

export const LogoWrap = styled.div`
`


export const SiteItem = styled.div<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  cursor: pointer;
  color: var(--c-app-header-menu-base);
  box-sizing: border-box;
  
  ${({ $active = false }) => {
    if ($active) {
      return css`
        background-color: var(--c-app-header-menu-active-bg);
        color: var(--c-app-header-menu-hover);
        `
    } 
    return css`
    `
  }}
  &:hover {
    color: var(--c-app-header-menu-hover);
  }
  
  ${bpMedium} {
    height: ${theme.sizing.navigationBarHeight};
  }
`

export const HeaderItem = styled.div<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  cursor: pointer;
  color: var(--c-app-header-menu-base);
  box-sizing: border-box;
  transition: background-color 0.3s ease-in-out;
  
  &[active] {
    background-color: var(--c-app-header-menu-active-bg);
    color: var(--c-app-header-menu-hover);
  }
  
  &:hover {
    color: var(--c-app-header-menu-hover);
  }
  
  ${bpMedium} {
    height: ${theme.sizing.navigationBarHeight};
  }
`

export const MenuItem = styled(HeaderItem)`
  align-self: flex-end;
  flex-direction: column;
  justify-content: center;
  padding: 12px;
`
export const SiteNavTop= styled.div`
  position: absolute;
  right: 16px;
  top: 8px;
  display: flex;
  justify-content: space-between;
  
  
  ${TransparentButton} {
    padding: 8px;
  }
`
export const SiteMenuItem = styled.div<{$active: boolean}>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  svg {
    flex-shrink: 0
  }
  &:hover {
    background-color: var(--tertiary-70);
  }

  &.noHover {
    &:hover {
      background-color: initial;
    }
  }
  ${({ $active }) => $active && css`
    background-color:  var(--c-app-header-menu-hover);
  `}
`
export const HeaderMenuItem = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  flex-shrink: 0;
  color: #BFBFBF;

  &:hover {
    background-color: var(--c-app-header-bg-hover);
    color: white;
  }

  &.noHover {
    &:hover {
      background-color: initial;
    }
  }
  ${({ $active }) => $active && css`
    background-color:  var(--c-app-header-bg-hover);
    color: white;
  `}
  transition: 0.1s ease-in-out;
  transition-property: background-color, color;
`
export const SiteMenuText = styled.div`
  font-size: 13px;
`

export const HeaderItemText = styled.div`
  align-items: center;
  font-size: 13px;
`

export const StyledHeaderDropItem = styled(HeaderItem)`
  display: none;
  
  &:hover {
    background-color: var(--c-app-header-menu-active-bg);
  }
  
  ${Svg} {
    margin-left: 5px;
    margin-right: 5px;
  }
  `

export const IconWrap = styled.div<{ $marginBottom?: number}>`
  height: 16px;
  display: flex;
  align-items: center;
  
  ${({ $marginBottom }) => $marginBottom && css`
  svg {
    margin-bottom: ${$marginBottom}px;
  }
  `}
  `

export const DropdownMenuItem = styled(HeaderMenuItem)`
  border-radius: 3px;
  ${HeaderItemText} {
    user-select: none;
    ${Svg} {
      margin-left: 5px;
      margin-bottom: 1px;
    }
  }
  `

export const HeaderSpacer = styled.div`
  opacity: 0.6;
  margin: 0 4px;
  height: 20px;
  `
export const SiteNavBody = styled.div`
  padding: 0 16px;
  overflow-y: auto;
  ${compactScrollBarV2}
  `

export const StyledDropMenuLinks = styled.div`
  padding-top: 0;
  line-height: 28px;
  display: flex;
  flex-direction: column;
  color: var(--c-text-700);
  border-radius: 3px;
  font-size: 14px;
  `

export const StyledDivider = styled.div`
  border-bottom: 1px solid var(--c-layout-border-200);
  padding-top: 6px;
  margin-bottom: 6px;
  `

const linkCss = css`
  background-color: var(--c-dropdown-bg);
  width: auto;
  transition: color 0.3s ease;
  padding: 0 12px;
  line-height: 30px;
  &:hover {
    background-color: var(--c-dropdown-hover-bg);
  }
  `

export const StyledLink = styled.a`
  ${linkCss}
  cursor: pointer;
  &:hover {
    color: inherit;
  }
  `

export const StyledOnClickModalDiv = styled.div`
  ${linkCss}
  cursor: pointer;
  `

export const HeaderLeft = styled.div`
  flex-wrap: nowrap;
  justify-self: flex-start;
  align-items: center;
  overflow-x: hidden;

  & > * {
    margin-right: 9px;
    flex: 0 0 auto;
  }
  
  display:none;
  ${bpSmall} {
    display: flex;
  }

  a {
    display: flex;
    max-width: max-content;
  }

  ${HeaderMenuItem} {
    border-radius: 3px;
  }
  
  &::after {
    content: '';
    width: 12px;
  }
`

export const HeaderRight = styled.div`
  justify-self: flex-end;
  display: flex;
  position: static;
  right: 0;
  align-items: center;
  justify-self: flex-end;
  margin-left: auto;
  min-width: fit-content;

  ${HeaderMenuItem}, ${StyledDropdown} {
    flex-shrink: 0;
  }
  
  ${HeaderItemText} {
    display: flex;
  }
  
  `

export const headerPaddings = css`
    padding-left: 32px;
    padding-right: 32px;
  `

export const Nav = styled.nav`
  gap: 16px;
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
  flex: 1;
  align-items: center;
  font-size: 12px;
  font-weight: ${theme.fontWeight.regular};
  white-space: nowrap;
  transition: all 0.18s ease-in-out;

  a {
    color: inherit;
    text-decoration: none;
  }

  ${TransparentButton} {
    flex-shrink: 0;
  }
`

export const StyledHeader = styled.header`
  display: flex;
  z-index: 3;
  box-sizing: border-box;
  background-color: var(--c-app-header-bg);
  border-bottom: 1px solid var(--c-app-header-border, transparent);
  color: var(--c-app-header-menu-base);
  min-height: var(--site-header-height);
  
  ${headerPaddings}

  ${MenuItem} {
      padding: 13px 10px;
    }
  `
  
export const StyledSiteNav = styled.div`
  top: calc(var(--site-header-height) + var(--rails-alert-height, 0px) + var(--site-alert-height, 0px));
  bottom: 0;
  left: 0;
  position: absolute;
  height: auto;
  width: 400px;
  background-color: var(--background-shaded);
  z-index: 3;
  box-shadow: 6px 0px 24px 0px rgba(0, 0, 0, 0);
  display: flex;
  flex-direction: column;
  
  ${SiteMenuItem} {
    color: var(--base);
    min-height: 24px;
    border-radius: 3px;
    padding-left: 10px;
    padding-right: 4px;
  }

  ${SiteMenuItem} .noHover {
    &:hover {
      background-color: initial;
    }
  }

  &.enter {
    transform: translateX(0);
    transition: transform 0.1s ease-in-out;
    box-shadow: 0px 0px 48px 0px rgba(0,0,0,0.45);
  }
  &.exit {
    transform: translateX(-100%);
    transition: transform 0.1s ease-in-out;
    box-shadow: 6px 0px 24px 0px rgba(0, 0, 0, 0);
  }
`

export const Row = styled.div`
  display: flex;
  gap: 32px;
  padding: 32px 0;

  & > div {
    min-width: 148px;
  } 
`

export const MenuSectionTitle = styled.div`
  font-size: 13px;
  line-height: 14px;
  min-height: 14px;
  font-weight: 900;
  padding-bottom: 4px;
`

export const SubLink = styled(SiteMenuItem)`
  cursor: pointer;
  padding: 4px 6px;
  min-height: 14px;
  font-size: 14px;
  font-weight: bold;
  justify-content: space-between;
  margin-left: 12px;
  svg {
    transform: rotate(180deg);
    opacity: 0.3;
    margin-right: 4px;
  }
`
export const EditMenuWrap = styled.div`
  cursor: pointer;
  position: sticky;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  background-color: var(--c-app-header-bg);
  padding: 0 12px;
  
  flex-shrink: 0;
  
  svg {
    transition: opacity 0.1s ease;
    opacity: 0.3;

    &:hover {
      opacity: 1;
    }
  }

`
