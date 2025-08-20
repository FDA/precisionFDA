import React from 'react'
import styled from 'styled-components'

export const StyledCheckbox = styled.input`
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  appearance: none;
  background: var(--tertiary-50);
  transition: all 0.2s ease;

  &:checked {
    background: #3b82f6;
    border-color: #3b82f6;
  }

  &:checked::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 12px;
    font-weight: bold;
  }

  &:hover {
    border-color: #9ca3af;
  }
`

export const Checkbox = React.forwardRef((props: any, ref) => <StyledCheckbox ref={ref} type="checkbox" {...props} />)

Checkbox.displayName = 'Checkbox'
