import styled, { css } from 'styled-components'

export const FieldLabel = styled.label`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-weight: bold;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0;
  color: var(--c-text-700);
`

export const FieldLabelRow = styled(FieldLabel)`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  width: fit-content;
  position: relative;
`

export const SelectFieldLabel = styled(FieldLabel)`
  white-space: nowrap;
  gap: 4px;
  select {
    height: 32px;
    border: 1px solid var(--c-layout-border);
    border-radius: 2px;
    padding-left: 8px;
    padding-right: 8px;
  }
`

export const FieldGroup = styled.div`
  text-wrap: pretty;
  display: flex;
  flex-direction: column;
  gap: 4px;
  label {
    font-weight: bold;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0;
    color: var(--c-text-700);
  }
`

export const Hint = styled.div`
  color: var(--c-text-500);
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
  border: 1px solid var(--tertiary-250);
  border-radius: 2px;
  padding: 4px 16px 4px 8px;
  ${inputFocus};
  font-size: 12px;
  background: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0Ljk1IDEwIj48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6dHJhbnNwYXJlbnQ7fS5jbHMtMntmaWxsOiMzMzM7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5hcnJvd3M8L3RpdGxlPjxyZWN0IGNsYXNzPSJjbHMtMSIgd2lkdGg9IjQuOTUiIGhlaWdodD0iMTAiLz48cG9seWdvbiBjbGFzcz0iY2xzLTIiIHBvaW50cz0iMS40MSA0LjY3IDIuNDggMy4xOCAzLjU0IDQuNjcgMS40MSA0LjY3Ii8+PHBvbHlnb24gY2xhc3M9ImNscy0yIiBwb2ludHM9IjMuNTQgNS4zMyAyLjQ4IDYuODIgMS40MSA1LjMzIDMuNTQgNS4zMyIvPjwvc3ZnPg==)
    no-repeat 95% 50%;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
`

// This exists becuase the color of the dropdown icon is hardcoded in the background image
// The style is used in the global theme definitions to detect the theme
export const inputSelectDarkModeHack = css`
  ${InputSelect} {
    background: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0Ljk1IDEwIj48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6dHJhbnNwYXJlbnQ7fS5jbHMtMntmaWxsOiNjY2M7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5hcnJvd3M8L3RpdGxlPjxyZWN0IGNsYXNzPSJjbHMtMSIgd2lkdGg9IjQuOTUiIGhlaWdodD0iMTAiLz48cG9seWdvbiBjbGFzcz0iY2xzLTIiIHBvaW50cz0iMS40MSA0LjY3IDIuNDggMy4xOCAzLjU0IDQuNjcgMS40MSA0LjY3Ii8+PHBvbHlnb24gY2xhc3M9ImNscy0yIiBwb2ludHM9IjMuNTQgNS4zMyAyLjQ4IDYuODIgMS40MSA1LjMzIDMuNTQgNS4zMyIvPjwvc3ZnPg==)
      no-repeat 95% 50%;
  }
`

export const InputError = styled.div`
  font-size: 14px;
  color: var(--warning-800);

  &::before {
    display: inline;
    content: '⚠ ';
  }
`

export const Divider = styled.div`
  box-sizing: border-box;
  width: 100%;
  border-bottom: 1.5px solid var(--c-layout-border);
`

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-weight: bold;
  gap: 4px;
  font-size: 14px;
  line-height: 32px;
  letter-spacing: 0;
  color: var(--c-text-700);

  input[type='checkbox'] {
    margin: 0;
  }
`

export const CheckboxTip = styled.span`
  font-size: 12px;
  color: var(--c-text-500);
`
