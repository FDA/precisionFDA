import styled, { css } from "styled-components"
import { theme } from "../../../styles/theme"

export const StyledMenu = styled.ul`
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 3px;
  padding: 0;
  margin: 0;
  padding: 5px 0;
  min-width: 26px;
  font-size: 14px;
`

export const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  padding-top: 4px;
`

export const StyledMessageItem = styled.li`
  line-height: 23px;
  padding: 0px 20px;
  list-style: none;
  font-style: italic;
  max-width: 200px;
`

export const StyledItem = styled.li<{isDisabled?: boolean}>`
  line-height: 23px;
  padding: 0px 20px;
  list-style: none;
  color: ${theme.colors.textDarkGrey};
  cursor: pointer;

  ${({ isDisabled = false }) => isDisabled && css`
    cursor: not-allowed;
    color: #777;

    &:hover {
      background-color: #fff
    }
  `}

  &:hover {
    background-color: ${theme.colors.backgroundLightGray}
  }

  a {
    line-height: 23px;
    color: ${theme.colors.textDarkGrey};
    text-decoration: none;
  }
`
