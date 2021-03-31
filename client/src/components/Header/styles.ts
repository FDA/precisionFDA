import styled from "styled-components";
import { theme } from "../../styles/theme";

export const StyledHeader = styled.header`
  background-color: ${theme.primary};
  color: rgba(227, 243, 252, 0.6);
  border-bottom: 1px solid ${theme.primaryShade};
`

export const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
`

export const HeaderIcon = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export const HeaderSpacer = styled.div`
  border-right: 1px solid rgba(227, 243, 252, 0.2);
  height: 40px;
`

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`
export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`
