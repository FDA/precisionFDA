import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { theme } from '../../styles/theme'
import { PFDALogoLight } from '../../views/components/NavigationBar/PFDALogo'
import { Svg } from '../icons/Svg'

const bpSmall = `@media(min-width: 850px)`
const bpMedium = `@media(min-width: 1045px)`
const bpLarge = `@media(min-width: 1200px)`
const bpSuper = `@media(min-width: 1340px)`

export const StyledHeaderLogo = styled(PFDALogoLight)`
  box-sizing: border-box;
  padding: 4px 0;
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

export const HeaderItem = styled.div<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  cursor: pointer;
  color: ${theme.colors.textWhite};
  box-sizing: border-box;

  ${({ active = false }) => {
    if (active) {
      return css`
        background-color: ${theme.colors.mediumDarkBlue};
        color: ${theme.colors.textWhite};
      `
    } else {
      return css`
        &:hover {
          color: ${theme.colors.lightBlue};
        }
      `
    }
  }}

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
`

export const StyledUsername = styled(HeaderItem)`
  display: none;

  &:hover {
    background-color: ${theme.colors.mediumDarkBlue};
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

export const AvatarMenuItem = styled(MenuItem)`
  ${HeaderItemText} {
    ${Svg} {
      margin-left: 5px;
      margin-bottom: 1px;
    }
  }

`

export const HeaderSpacer = styled.div`
  border-right: 1px solid #5f768a;
  margin: 0 4px;
  height: 38px;
`

export const StyledDropMenuLinks = styled.div`
  padding-top: 0;
  line-height: 28px;
  display: flex;
  flex-direction: column;
  color: ${theme.colors.textDarkGrey};
`

export const StyledDivider = styled.div`
  border-bottom: 1px solid ${theme.colors.borderDefault};
  padding-top: 6px;
  margin-bottom: 6px;
`

const linkCss = css`
  width: auto;
  transition: color 0.3s ease;
  padding: 0 12px;
  line-height: 30px;
  &:hover {
    background-color: ${theme.colors.textLightGrey};
  }
`

export const StyledLinkReactRoute = styled(Link)`
  ${linkCss}
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
      display: inline;
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
      display: inline;
    }

    ${IconWrap} {
      align-items: flex-end;
    }
  }
`

export const StyledHeader = styled.header`
  background-color: ${theme.colors.darkBlue};
  color: ${theme.colors.textWhite};
  padding: 0 8px;

  ${bpSmall} {
    padding: 0 16px;

    ${HeaderItem} {
      padding: 8px 6px;
    }

    ${StyledUsername} {
      display: flex;
      padding-left: 5px;
    }
  }

  ${bpMedium} {
    padding: 0 ${theme.padding.mainContentHorizontal};
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
