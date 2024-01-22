import styled from 'styled-components'

export const Button = styled.button`
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
  line-height: 1.428571429;
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 3px;
  border-color: var(--tertiary-250);
  background: var(--tertiary-200);

  &:hover {
    filter: brightness(95%);
  }
  
  &:focus {
    outline: 0;
  }

  &[disabled] {
    cursor: not-allowed;
    color: var(--c-text-400);
    &:hover {
      filter: brightness(100%);
    }
  }
  
  &[data-variant="primary"] {
    border-color: var(--primary-600);
    background: var(--primary-500);
    color: hsl(0, 0%, 96%);
    &:hover {
      filter: brightness(90%);
    }
    &[disabled] {
      color: hsl(207, 70%, 79%);
      filter: brightness(100%);
      &:hover {
      }
    }
  }
`