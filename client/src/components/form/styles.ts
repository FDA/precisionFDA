import styled, { css } from "styled-components";
import { theme } from "../../styles/theme";

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const Hint = styled.div`
  color: ${theme.colors.textMediumGrey};
  font-size: 14px;
`

export const inputFocus = css`
  &:focus {
    border-color: #40a9ff;
    border-right-width: 1px !important;
    outline: 0;
    box-shadow: 0 0 0 2px rgb(24 144 255 / 20%);
  }
`

export const InputSelect = styled.select`
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  padding: 4px 10px;
  ${inputFocus}
`

export const InputError = styled.div`
  color: ${theme.colors.stateFailedColor};
  
  &::before {
    display: inline;
    content: "⚠ ";
  }
`
