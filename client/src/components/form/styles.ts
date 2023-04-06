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
  padding: 4px 16px 4px 8px;
  ${inputFocus}
  font-size: 12px;

  background: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0Ljk1IDEwIj48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6I2ZmZjt9LmNscy0ye2ZpbGw6IzQ0NDt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPmFycm93czwvdGl0bGU+PHJlY3QgY2xhc3M9ImNscy0xIiB3aWR0aD0iNC45NSIgaGVpZ2h0PSIxMCIvPjxwb2x5Z29uIGNsYXNzPSJjbHMtMiIgcG9pbnRzPSIxLjQxIDQuNjcgMi40OCAzLjE4IDMuNTQgNC42NyAxLjQxIDQuNjciLz48cG9seWdvbiBjbGFzcz0iY2xzLTIiIHBvaW50cz0iMy41NCA1LjMzIDIuNDggNi44MiAxLjQxIDUuMzMgMy41NCA1LjMzIi8+PC9zdmc+) no-repeat 95% 50%;
  -moz-appearance: none; 
  -webkit-appearance: none; 
  appearance: none;
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
