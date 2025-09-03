import styled, { css } from 'styled-components'

export const Button = styled.button.attrs(({ disabled }) => ({ 'aria-disabled': disabled ? true : undefined }))<{
  'data-variant'?: 'primary' | 'success' | 'warning' | 'link'
  disabled?: boolean
  active?: BooleanString
}>`
  position: relative;
  display: flex;
  gap: 8px;
  width: fit-content;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  text-align: center;
  background-image: none;
  border: 1px solid var(--c-layout-border);
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  line-height: 1.475;
  padding: 7px 15px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 5px;
  background: var(--tertiary-30);
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px var(--base-opacity-06);
  border-color: var(--tertiary-300);
  min-width: 100px;

  &:active {
    box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.2);
  }

  &:hover {
    filter: brightness(97%);
  }

  &:focus {
    outline: 0;
  }

  &[data-variant='primary'] {
    border: none;
    background: linear-gradient(135deg, var(--primary-400) 0%, var(--primary-500) 100%);
    color: white;

    &:hover:not([aria-disabled='true']) {
      background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    &:active {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  &[data-variant='success'] {
    border: none;
    background: linear-gradient(135deg, var(--success-500) 0%, var(--success-600) 100%);
    color: white;

    &:hover:not([aria-disabled='true']) {
      background: linear-gradient(135deg, var(--success-600) 0%, var(--success-700) 100%);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    &:active {
      background: linear-gradient(135deg, var(--success-700) 0%, var(--success-800) 100%);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  &[data-variant='warning'] {
    border: none;
    background: linear-gradient(135deg, var(--warning-500) 0%, var(--warning-600) 100%);
    color: white;

    &:hover:not([aria-disabled='true']) {
      background: linear-gradient(135deg, var(--warning-600) 0%, var(--warning-700) 100%);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    &:active {
      background: linear-gradient(135deg, var(--warning-700) 0%, var(--warning-800) 100%);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  &[data-variant='link'] {
    background: transparent;
    border: 1px solid transparent;
    box-shadow: none;
    color: var(--c-link);
    padding: 8px 12px;
    min-width: auto;

    &:hover:not([aria-disabled='true']) {
      color: var(--c-link-hover);
      background: var(--primary-50);
      transform: none;
      box-shadow: none;
    }

    &:active {
      color: var(--c-link-hover);
      background: var(--primary-100);
      transform: none;
    }
  }

  &[aria-disabled] {
    cursor: not-allowed;
    opacity: 0.6;
    color: var(--c-text-400);
    background: var(--tertiary-200);
    border-color: var(--tertiary-300);

    &:hover {
      transform: none;
      box-shadow: 0 1px 2px var(--base-opacity-06);
    }

    &:active {
      transform: none;
      box-shadow: 0 1px 2px var(--base-opacity-06);
    }
  }
`

export const OutlineButton = styled(Button)`
  background: transparent;
  color: white;
`

export const TransparentButton = styled(Button)`
  display: flex;
  box-shadow: none;
  min-width: auto;
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

export const IconButton = styled(TransparentButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  min-width: 32px;
  height: 32px;
  border-radius: 50%;
  &:active {
    top: 0;
  }
  &:hover,
  &:focus {
    background-color: rgba(0, 0, 0, 0.05);
  }
`

export const SwitchButton = styled.div`
  box-sizing: content-box !important;
  display: flex;
  width: 24px;
  height: 12px;
  border-radius: 9999px;
  background-color: var(--tertiary-500);
  padding: 2px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: inherit;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &[data-active='true'] {
    background: var(--success-500);

    &::before {
      transform: translateX(12px);
    }
  }

  &:hover {
    &[data-active='true'] {
      background: var(--success-600);
    }

    &:not([data-active='true']) {
      background: var(--tertiary-600);
    }
  }
`

export const buttonDarkModeHack = css``
