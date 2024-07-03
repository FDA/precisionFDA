import styled, { css } from 'styled-components'

export const Button = styled.button.attrs(({ disabled }) => ({ 'aria-disabled': disabled ? true : undefined }))<{
  variant?: 'primary' | 'success' | 'warning' | 'link'
  disabled?: boolean
  active?: boolean
}>`
  position: relative;
  display: flex;
  width: fit-content;
  align-items: center;
  white-space: nowrap;
  text-align: center;
  background-image: none;
  border: 1px solid transparent;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.015);
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  line-height: 1.4285;
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 3px;
  border-color: var(--tertiary-300);
  background: var(--tertiary-100);

  &:active {
    box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.2);
  }

  &:hover {
    filter: brightness(97%);
  }

  &:focus {
    outline: 0;
  }

  &[variant='primary'] {
    border-color: var(--primary-600);
    background: var(--primary-500);
    color: hsl(0, 0%, 97%);
    &:hover {
      filter: brightness(94%);
    }
    &:active {
      box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.26);
      filter: brightness(93%);
      border-color: var(--primary-500);
    }
  }

  &[variant='warning'] {
    border-color: var(--warning-600);
    background: var(--warning-500);
    color: hsl(0, 0%, 97%);
    &:hover {
      filter: brightness(94%);
    }
    &:active {
      box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.26);
      filter: brightness(93%);
      border-color: var(--warning-500);
    }
  }

  &[variant='success'] {
    border-color: var(--success-700);
    background: var(--success-600);
    color: hsl(0, 0%, 97%);
    &:hover {
      filter: brightness(94%);
    }
    &:active {
      box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.26);
      filter: brightness(93%);
      border-color: var(--success-600);
    }
  }

  &[variant='link'] {
    background: none;
    border: none;
    box-shadow: none;
    color: var(--c-link);
    &:hover {
      color: var(--c-link-hover);
    }
    &:active {
      color: var(--c-link-hover);
    }
  }

  &[aria-disabled] {
    cursor: not-allowed;
    color: var(--c-text-400);
    border: 1px solid transparent;
    background-color: var(--tertiary-200);
    &:hover {
      filter: initial;
    }
    &:active {
      box-shadow: initial;
      border: 1px solid transparent;
    }
  }
`

export const TransparentButton = styled(Button)`
  display: flex;
  box-shadow: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  &:active {
    position: relative;
    top: 1px;
    outline: none;
    box-shadow: none;
    filter: none;
  }
  &:focus {
    outline: none;
  }
`

export const buttonDarkModeHack = css``
