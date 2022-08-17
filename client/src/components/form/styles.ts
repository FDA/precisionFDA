import styled, { css } from "styled-components";
import { colors } from "../../styles/theme";

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  label {
    font-weight: bold;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0;
    color: ${colors.textDarkGrey};
  }
`

export const Hint = styled.div`
  color: ${colors.textMediumGrey};
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
  font-size: 14px;
  color: ${colors.stateFailedColor};
  
  &::before {
    display: inline;
    content: "⚠ ";
  }
`

export const Divider = styled.div`
  box-sizing: border-box;
  width: 100%;
  border-bottom: 1.5px solid #d9d9d9;
`
