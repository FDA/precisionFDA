import styled, { css } from 'styled-components'
import { theme } from '../../styles/theme'
import { PFDALogoLight } from '../NavigationBar/PFDALogo'
import { Svg } from '../icons/Svg'

const bpSmall = '@media(min-width: 850px)'
const bpMedium = '@media(min-width: 1045px)'
const bpLarge = '@media(min-width: 1200px)'
const bpSuper = '@media(min-width: 1340px)'

export const StyledHeaderLogo = styled(PFDALogoLight)`
  box-sizing: border-box;
  padding: 4px 0;
  min-width: 143.98px;
`

export const LogoWrap = styled.div`
  margin-right: 10px;
`

export const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  font-size: 12px;
  font-weight: ${theme.fontWeight.regular};
  white-space: nowrap;
  transition: all 0.18s ease-in-out;

  a {
    color: inherit;
    text-decoration: none;
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

export const MenuItem = styled(HeaderItem)`
  align-self: flex-end;
  flex-direction: column;
  justify-content: center;
  padding: 12px;
`

export const HeaderItemText = styled.div`
  margin-top: 4px;
  display: none;
  align-items: center;
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

export const IconWrap = styled.div`
  height: 16px;
  margin-top: 3px;
  display: flex;
  align-items: center;
`

export const DropdownMenuItem = styled(MenuItem)`
  ${HeaderItemText} {
    ${Svg} {
      margin-left: 5px;
      margin-bottom: 1px;
    }
  }
`

export const HeaderSpacer = styled.div`
  border-right: 1px solid var(--c-layout-border);
  opacity: 0.6;
  margin: 0 4px;
  height: 38px;
`

export const StyledDropMenuLinks = styled.div`
  padding-top: 0;
  line-height: 28px;
  display: flex;
  flex-direction: column;
  color: var(--c-text-700);
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: 3px;
  box-shadow: 0 6px 12px rgba(0,0,0,0.175);
`

export const StyledDivider = styled.div`
  border-bottom: 1px solid var(--c-layout-border);
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
`

export const StyledOnClickModalDiv = styled.div`
  ${linkCss}
  cursor: pointer;
`

export const HeaderLeft = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-self: flex-start;
  align-items: center;

  &::after {
    content: '';
    width: 12px;
  }

  ${bpSmall} {
    ${HeaderItemText} {
      display: flex;
    }
    ${IconWrap} {
      align-items: flex-end;
    }
  }
`

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  justify-self: flex-end;
  margin-left: auto;

  ${bpMedium} {
    ${HeaderItemText} {
      display: flex;
    }

    ${IconWrap} {
      align-items: flex-end;
    }
  }
`

export const headerPaddings = css`
  padding-left: 8px;
  padding-right: 8px;

  ${bpSmall} {
    padding-left: 16px;
    padding-right: 16px;
  }

  ${bpMedium} {
    padding-left: 32px;
    padding-right: 32px;
  }
`

export const StyledHeader = styled.header`
  box-sizing: border-box;
  background-color: var(--c-app-header-bg);
  border-bottom: 1px solid var(--c-app-header-border, transparent);
  color: var(--c-app-header-menu-base);

  ${headerPaddings}

  ${bpSmall} {
    ${HeaderItem} {
      padding: 8px 6px;
    }

    ${StyledHeaderDropItem} {
      display: flex;
      padding-left: 5px;
    }
  }

  ${bpLarge} {
    ${Nav} {
      font-size: 14px;
    }

    ${MenuItem} {
      padding: 10px 6px;
    }
  }

  ${bpSuper} {
    ${MenuItem} {
      padding: 13px 10px;
    }
  }
`
