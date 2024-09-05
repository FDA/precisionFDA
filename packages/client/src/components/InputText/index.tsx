import styled, { css } from 'styled-components'
import { theme } from '../../styles/theme'

export const InputText = styled.input.attrs({ type: 'text' })`
    font-family: ${theme.fontFamily};
    box-sizing: border-box;
    margin: 0;
    font-variant: tabular-nums;
    list-style: none;
    font-feature-settings: 'tnum';
    position: relative;
    display: inline-block;
    width: 100%;
    min-width: 0;
    padding: 4px 10px;
    color: var(--c-text-700);
    font-size: 14px;
    line-height: 1.5715;
    background-color: var(--tertiary-30);
    background-image: none;
    border: 1px solid var(--c-input-border);
    border-radius: 2px;
    transition: all 0.3s;

    &:focus {
        border-color: var(--primary-600);
        border-right-width: 1px !important;
        outline: 0;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }

    &:-webkit-autofill,
    &:-webkit-autofill:focus {
        transition: background-color 600000s 0s, color 600000s 0s;
    }

    &[data-autocompleted] {
        background-color: transparent !important;
    }

    ${({ disabled }) => disabled && css`
      background-color: var(--tertiary-100);
    `}
`

export const InputDateTime = styled(InputText).attrs({ type: 'datetime-local' })``
export const InputFile = styled(InputText).attrs({ type: 'file' })``
export const InputNumber = styled(InputText).attrs({ type: 'number' })``
export const InputTextArea = styled(InputText).attrs({ as: 'textarea' })`
  transition: none;
`

export const InputId = styled(InputText).attrs({ type: 'text' })`
  // Hide input arrows
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`
