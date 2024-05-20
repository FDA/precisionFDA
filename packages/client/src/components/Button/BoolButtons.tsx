import styled, { css } from 'styled-components'
import { Button } from '.'

export const BoolButton = styled(Button)`
  --color: #d9d9d9;
  --darkText: #757575;
  background-color: var(--color);
  border-color: var(--color);
  border: none;
  color: var(--darkText);
  height: 30px;

  &:hover {
    color: var(--darkText);
    border-color: var(--color);
    ${({ disabled }) =>
      !disabled &&
      css`
        color: var(--darkText);
      `}
    ${({ disabled }) =>
      disabled &&
      css`
        color: var(--darkText);
        cursor: not-allowed;
      `}
    ${({ active }) =>
      active &&
      css`
        color: white;
        background-color: var(--primary-500);
        border-color: var(--primary-500);
      `}
  }

  ${({ active }) =>
    active &&
    css`
      color: white;
      background-color: var(--primary-500);
      border-color: var(--primary-500);
    `}
`

export const BoolButtonGroup = styled.div`
  display: flex;

  &:first-child {
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
    border-right: 0px;
  }
  &:last-child {
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
  }
  button {
    border-radius: 0px;
  }
`
