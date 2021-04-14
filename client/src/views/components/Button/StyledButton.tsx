import styled, { css } from 'styled-components'
import { fontWeight, theme } from '../../../styles/theme'

export interface IButton {
  active?: 'warning' | 'danger' | 'success' | boolean
  disabled?: boolean
  role?: string
  hide?: boolean
}

export const StyledButton = styled.button<IButton>`
  line-height: 1.5715;
  position: relative;
  display: inline-block;
  font-weight: ${fontWeight.bold};
  white-space: nowrap;
  text-align: center;
  background-image: none;
  border: 1px solid transparent;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.015);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  user-select: none;
  touch-action: manipulation;
  height: 30px;
  padding: 2px 12px;
  font-size: 14px;
  border-radius: 2px;
  color: rgba(0, 0, 0, 0.65);
  background: ${theme.white};
  border-color: ${theme.whiteGrey};

  &:hover {
    ${({ disabled }) =>
      !disabled &&
      css`
        color: ${theme.primary};
        background: ${theme.white};
        border-color: ${theme.primary};
      `}
  }

  &:focus {
    outline: 0;
  }

  ${({ active }) =>
    active &&
    css`
      color: ${theme.primary};
      border-color: ${theme.primary};
    `}

  ${({ role }) =>
    role === 'warning' &&
    css`
      background: ${theme.lightLightYellow};
      color: ${theme.lightYellow};
      border-color: ${theme.lightLightYellow};
    `}
  ${({ role }) =>
    role === 'danger' &&
    css`
      background: ${theme.lightRedDisabled};
      color: ${theme.darkRed};
      border-color: ${theme.lightRedDisabled};
    `}
  ${({ role }) =>
    role === 'success' &&
    css`
      background: ${theme.lightGreenDisabled};
      color: ${theme.lightGreen};
      border-color: ${theme.lightGreenDisabled};
    `}

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
    `}

  ${({ hide }) =>
    hide &&
    css`
      display: none;
    `}
`

export const ButtonSolidBlue = styled(StyledButton)`
  background-color: ${theme.primary};
  border-color: ${theme.primary};
  color: ${theme.white};

  &:hover {
    ${({ disabled }) =>
      !disabled &&
      css`
        color: ${theme.white};
        background-color: ${theme.primaryLite};
        border-color: ${theme.primaryLite};
      `}
    ${({ disabled }) =>
      disabled &&
      css`
        cursor: not-allowed;
      `}
  }
`

export const ButtonSolidGreen = styled(StyledButton)`
  color: ${theme.white};
  background-color: ${theme.green};
  border-color: ${theme.green};

  &:hover {
    ${({ disabled }) =>
      !disabled &&
      css`
        color: ${theme.white};
        background-color: ${theme.lightGreen};
        border-color: ${theme.lightGreen};
      `}
    ${({ disabled }) =>
      disabled &&
      css`
        cursor: not-allowed;
      `}
  }
`

export const ButtonSolidRed = styled(StyledButton)`
  color: ${theme.white};
  background-color: ${theme.darkRed};
  border-color: ${theme.darkRed};

  &:hover {
    ${({ disabled }) =>
      !disabled &&
      css`
        color: ${theme.white};
        background-color: ${theme.lightRed};
        border-color: ${theme.lightRed};
      `}
    ${({ disabled }) =>
      disabled &&
      css`
        cursor: not-allowed;
      `}
  }
`
