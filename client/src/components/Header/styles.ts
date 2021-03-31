import styled, { css } from "styled-components";
import { theme } from "../../styles/theme";
import { Svg } from "../icons/Svg";

export const StyledHeader = styled.header`
  background-color: ${theme.primary};
  border-bottom: 1px solid ${theme.primaryShade};
`

export const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 68px;
  color: rgba(227, 243, 252, 0.6);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  white-space: nowrap;

  a {
    color: inherit;
    text-decoration: none;
  }
`

export const StyledSupport = styled.div`
  display: flex;

  ${Svg} {
    margin-right: 5px;
  }
`

export const StyledUsername = styled.div`
  display: flex;
  align-items: center;

  ${Svg} {
    margin-left: 5px;
    padding-top: 2px;
  }
`

export const HeaderItem = styled.div<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  align-self: flex-end;
  cursor: pointer;

  &:hover {
    color: ${theme.white}
  }

  ${({ active = false }) => active && css`
    color: ${theme.white};

    ${Svg} {
      color: rgb(235, 119, 111);
    }
  `}
`

export const HeaderItemText = styled.div`
`

export const HeaderSpacer = styled.div`
  border-right: 1px solid rgba(227, 243, 252, 0.2);
  height: 40px;
`

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`
export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`
