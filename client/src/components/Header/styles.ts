import styled, { css } from 'styled-components'
import { theme } from '../../styles/theme'
import { Svg } from '../icons/Svg'

export const StyledHeader = styled.header`
  background-color: ${theme.primary};
  border-bottom: 1px solid ${theme.primaryShade};
`

export const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
  min-height: 68px;
  color: rgba(227, 243, 252, 0.6);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  white-space: nowrap;
  flex-wrap: wrap;

  a {
    color: inherit;
    text-decoration: none;
  }
`

export const HeaderItem = styled.div<{ active?: boolean }>`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  cursor: pointer;

  &:hover {
    color: ${theme.white};
  }

  ${({ active = false }) =>
    active &&
    css`
      color: ${theme.white};

      ${Svg} {
        color: rgb(235, 119, 111);
      }
    `}
`

export const MenuItem = styled(HeaderItem)`
  align-self: flex-end;
  flex-direction: column;
  padding: 10px;
`

export const StyledSupport = styled(HeaderItem)`
  ${Svg} {
    margin-right: 5px;
  }
`

export const StyledUsername = styled(HeaderItem)`
  padding: 10px;
  &:hover {
    background-color: ${theme.primaryShade};
  }

  ${Svg} {
    margin-left: 5px;
    padding-top: 2px;
  }
`

export const HeaderItemText = styled.div``

export const HeaderSpacer = styled.div`
  border-right: 1px solid rgba(227, 243, 252, 0.2);
  height: 40px;
`

export const HeaderLeft = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-self: flex-start;
  align-items: center;
  gap: 10px;
  &::after {
    content: "";
    width: 20px;
  }
`
export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  justify-self: flex-end;
`

export const StyledDropMenuLinks = styled.div`
  padding: 1rem;
  padding-top: 0px;
  line-height: 2.8rem;
`

export const StyledLinkWrapper = styled.div`
  color: ${theme.darkerGrey};
  transition: color 0.3s ease;
`

export const StyledLink = styled.a`
`
