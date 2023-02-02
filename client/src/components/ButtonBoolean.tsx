import React from 'react'
import { ButtonGroup } from './Button/ButtonGroup'
import { Button, ButtonSolidBlue } from './Button'

/**
 * Component for showing boolean values (including undefined). Component
 * consists of two buttons - True and False. Clicking on either of them
 * sets the value and highlights the button that's displaying the value.
 * 
 * If no default value is provided no button is highlighted.
 * 
 * If default value is provided corresponding button is marked as default.
 */
export const ButtonBoolean = ({ value, onChange, onBlur, defaultValue, disabled }:
  {
    value?: boolean, onChange: (value?: boolean) => void, onBlur?: () => void,
    defaultValue?: boolean, disabled?: boolean
  }) => {

  const onChangeWithBlur = (val: boolean) => {
    onChange(val)
    if (onBlur) {
      onBlur()
    }
  }

  return (
    <ButtonGroup>
      {(value === false || value === undefined) &&
        <Button onClick={() => onChangeWithBlur(true)} disabled={disabled}>
          True {defaultValue === true ? '(default)' : ''}
        </Button>}
      {value && <ButtonSolidBlue disabled={disabled}>
        True {defaultValue === true ? '(default)' : ''}
      </ButtonSolidBlue>}

      {(value || value === undefined) &&
        <Button onClick={() => onChangeWithBlur(false)} disabled={disabled}>
          False {defaultValue === false ? '(default)' : ''}
        </Button>}
      {value === false &&
        <ButtonSolidBlue disabled={disabled}>
          False {defaultValue === false ? '(default)' : ''}
        </ButtonSolidBlue>}
    </ButtonGroup>
  )
}