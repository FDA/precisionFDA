import React from 'react'
import styled from 'styled-components'
import { Button } from './Button'

const StyledBooleanRadioButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

/**
 * Component for showing boolean values (including null). Component
 * consists of two radio buttons - True and False. Clicking on either of them
 * sets the value and highlights the button that's displaying the value.
 *
 * If no value is provided no button is highlighted.
 */
export const BooleanRadioButtons = ({
  value,
  onChange,
  onBlur,
  disabled,
  optional,
}: {
  value?: 'true' | 'false' | boolean
  onChange: (value: 'true' | 'false' | null) => void
  onBlur?: () => void
  disabled?: boolean
  optional?: boolean
}) => {
  let val = value
  if (typeof value === 'boolean') {
    val = value ? 'true' : 'false'
  }
  const onChangeWithBlur = (e: any) => {
    onChange(e.target.value)
    if (onBlur) {
      onBlur()
    }
  }

  const handleClear = () => {
    onChange(null)
  }

  return (
    <StyledBooleanRadioButtons>
      <label htmlFor="boolean-true">
        <input
          onChange={onChangeWithBlur}
          type="radio"
          value="true"
          checked={val === 'true'}
          id="boolean-true"
        />
        True
      </label>
      <label htmlFor="boolean-false">
        <input
          onChange={onChangeWithBlur}
          type="radio"
          value="false"
          checked={val === 'false'}
          id="boolean-false"
        />
        False
      </label>
      {optional && (
        <Button type="button" onClick={handleClear}>
          Clear
        </Button>
      )}
    </StyledBooleanRadioButtons>
  )
}
