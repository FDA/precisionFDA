import React, { ChangeEvent } from 'react'
import styled, { css } from 'styled-components'

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M20 6 9 17 4 12" fill="none" stroke="currentColor" strokeWidth="4" />
  </svg>
)

const IndeterminateIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <rect x="4" y="11" width="16" height="4" fill="currentColor" />
  </svg>
)



const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  opacity: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;

  &:focus + div {
    box-shadow: 0 0 0 3px var(--primary-200);
  }
`

const StyledCheckbox = styled.div<{ checked?: boolean; $indeterminate?: boolean, disabled?: boolean }>`
  --checked-background-color: var(--primary-500);
  --background-color: var(--background);
  --focus-color: var(--primary-200);
  --base-color: var(--tertiary-300);
  --icon-color: white;

  display: inline-flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  width: 12px;
  height: 12px;
  background: ${props => (props.checked || props.$indeterminate ? 'var(--checked-background-color)' : 'transparent')};
  border: 1px solid ${props => props.checked ? 'var(--checked-background-color)' : 'var(--base-color)'};
  border-radius: 3px;
  color: var(--base-color);

  svg {
    visibility: ${props => (props.checked || props.$indeterminate ? 'visible' : 'hidden')};
    color: ${props => (props.checked ? 'var(--icon-color)' : 'var(--checked-background-color)')};
  }

  ${props => props.$indeterminate && css`
    background-color: var(--background);
    svg {
      color: var(--base-color);
    }
  `}

  ${props => props.disabled && css`
    background-color: var(--background-shaded);
    border-color: var(--base-color);
    svg {
      color: var(--tertiary-500);
    }
  `}
`

export type CheckboxProps = {
  id?: string
  disabled?: boolean
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  checked: boolean
  indeterminate?: boolean
}


// If the layout shifts when clicking a checkbox, make sure to set the parent to position: relative;
// The cuase is absolute positioning on the hidden checkbox.
export const Checkbox = React.forwardRef((props: CheckboxProps, ref) => {
  const isChecked = props.checked ? props.checked : false
  return (
    <>
      <HiddenCheckbox id={props.id} ref={ref} checked={isChecked} onChange={props.onChange} />
      <StyledCheckbox checked={isChecked} $indeterminate={props.indeterminate} disabled={props.disabled}>
        {props.indeterminate ? <IndeterminateIcon /> : <CheckIcon />}
      </StyledCheckbox>
    </>
  )
})

Checkbox.displayName = 'Checkbox'
