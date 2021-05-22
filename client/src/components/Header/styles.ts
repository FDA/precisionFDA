import styled, { css } from 'styled-components'
import { theme } from '../../styles/theme'
import { PFDALogoLight } from '../../views/components/NavigationBar/PFDALogo'
import { Svg } from '../icons/Svg'


const smallestHeader = '@media(max-width: 800px)'  // TODO: Move to theme.ts
const smallHeader = '@media(max-width: 1024px)'  // TODO: Move to theme.ts
const mediumHeader = '@media(max-width: 1280px)'  // TODO: Move to theme.ts

export const StyledHeader = styled.header`
  /* position: fixed;
  top: 0;
  left: 0;
  right: 0; */
  background-color: ${theme.colors.darkBlue};
  color: ${theme.colors.textWhite};
  padding: 0px ${theme.padding.mainContentHorizontal};

  ${mediumHeader} {
    padding: 0px;
  }
`

export const HeaderLeft = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-self: flex-start;
  align-items: center;
  &::after {
    content: "";
    width: ${theme.padding.contentMargin};
  }
`

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  justify-self: flex-end;
  margin-left: auto;
`

export const StyledHeaderLogo = styled(PFDALogoLight)`
  width: 162px;
  height: 36px;
  margin: 0px ${theme.padding.contentMargin};

  ${smallestHeader} {
    width: 108px;
    height: 24px;
  }
`

export const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
  font-size: 14px;
  font-weight: ${theme.fontWeight.regular};
  white-space: nowrap;
  transition: all .18s ease-in-out;

  a {
    color: inherit;
    text-decoration: none;
  }

  ${smallHeader} {
    font-size: 11px;
  }
`

export const HeaderItem = styled.div<{ active?: boolean }>`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  cursor: pointer;
  color: ${theme.colors.textWhite};
  max-height: ${theme.sizing.navigationBarHeight};

  ${smallestHeader} {
    max-height: ${theme.sizing.navigationBarHeightNarrow};
  }

  ${({ active = false }) => {
    if (active) {
      return css`
        background-color: ${theme.colors.mediumDarkBlue};
      `
    }
    else {
      return css`
        &:hover {
          color: ${theme.colors.textLightGrey};
        }
      `
    }
  }}
`

export const MenuItem = styled(HeaderItem)`
  align-self: flex-end;
  flex-direction: column;
  padding: ${theme.padding.contentMargin} ${theme.padding.contentMargin} ${theme.padding.contentMarginHalf} ${theme.padding.contentMargin};

  ${mediumHeader} {
    padding-left: ${theme.padding.contentMarginHalf};
    padding-right: ${theme.padding.contentMarginHalf};
  }

  ${smallHeader} {
    padding-left: ${theme.padding.contentMarginThird};
    padding-right: ${theme.padding.contentMarginThird};
  }
`

export const StyledSupport = styled(HeaderItem)`
  ${Svg} {
    margin-right: 5px;
  }
`

export const StyledUsername = styled(HeaderItem)`
  &:hover {
    background-color: ${theme.colors.mediumDarkBlue};
  }

  ${Svg} {
    margin-left: 5px;
    padding-top: 2px;
  }

  ${smallestHeader} {
    display: none;
  }
`

export const HeaderItemText = styled.div`
  margin-top: ${theme.padding.contentMarginThird};

  ${smallestHeader} {
    display: none;
  }
`

export const HeaderSpacer = styled.div`
  border-right: 1px solid ${theme.colors.lightBlue};
  margin: 0px ${theme.padding.contentMarginThird};
  height: 38px;
`

export const StyledDropMenuLinks = styled.div`
  padding-top: 0px;
  line-height: 28px;
  display: flex;
  flex-direction: column;
  color: ${theme.colors.textDarkGrey};
`

export const StyledDivider = styled.div`
  border-bottom: 1px solid ${theme.colors.borderDefault};
  padding-top: ${theme.padding.contentMarginHalf};
  margin-bottom: ${theme.padding.contentMarginHalf};
`

export const StyledLink = styled.a`
  width: auto;
  transition: color 0.3s ease;
  padding: 0px ${theme.padding.contentMargin};
  line-height: 30px;
  &:hover {
    color: ${theme.colors.textMediumGrey};
  }
`
