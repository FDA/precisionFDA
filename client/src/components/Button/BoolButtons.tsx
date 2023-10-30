import styled, { css } from 'styled-components'
import { Button, IButton } from '.'
import { theme } from '../../styles/theme'

export const BoolButton = styled(Button)<IButton>`
  --color: #d9d9d9;
  --darkText: #757575;
  background-color: ${theme.colors.textWhite};
  border-color: var(--color);
  color: var(--darkText);

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
        color: ${theme.colors.textMediumGrey};
        cursor: not-allowed;
      `}
    ${({ active }) =>
      active &&
      css`
        color: ${theme.colors.textWhite};
        background-color: ${theme.colors.primaryBlue};
        border-color: ${theme.colors.primaryBlue};
      `}
  }

  ${({ active }) =>
    active &&
    css`
      color: ${theme.colors.textWhite};
      background-color: ${theme.colors.primaryBlue};
      border-color: ${theme.colors.primaryBlue};
    `}
`

export const BoolButtonGroup = styled.div`
  display: flex;

  & :first-child {
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
    border-right: 0px;
  }
  & :last-child {
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
  }
  button {
    border-radius: 0px;
  }
`
