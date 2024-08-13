import styled from 'styled-components'
import { Button } from '.'

export const BoolButton = styled(Button)<{'data-selected': BooleanString }>`
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
    
    [aria-disabled='true'] {
      color: var(--darkText);
      cursor: not-allowed;
      &[data-selected='true'] {
        color: white;
        background-color: var(--primary-500);
        border-color: var(--primary-500);
      }
    }
  }

  &[data-selected='true'] {
    color: white;
    background-color: var(--primary-500);
    border-color: var(--primary-500);
  }
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
