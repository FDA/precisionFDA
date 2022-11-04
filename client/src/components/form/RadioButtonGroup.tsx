import React, { Fragment, useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import { colors } from '../../styles/theme'


const Group = styled.div<{ disabled: boolean }>`
  clear: both;
  display: inline-block;

  input[type='radio'] {
    opacity: 0;
    position: fixed;
    width: 0;
    pointer-events: none;
  }

  label {
    user-select: none;

    &:focus {
      box-shadow: 0 0 0 4px rgb(13 110 253 / 50%);
    }
  }

  .radio-button {
    & + label {
      float: left;
      padding: 0.5em 1em;
      cursor: pointer;
      border: 1px solid ${colors.primaryBlue};
      margin-right: -1px;
      color: ${colors.primaryBlue};

      &:first-of-type {
        border-radius: 3px 0 0 3px;
      }

      &:last-of-type {
        border-radius: 0 3px 3px 0;
      }

      &:only-of-type {
        border-radius: 3px 3px 3px 3px;
      }
    }

    &:checked + label {
      background-color: ${colors.primaryBlue};
      color: ${colors.textWhite};
    }
  }

  ${({ disabled }) => disabled && css`
  .radio-button {
    & + label {
      cursor: not-allowed;
      border: 1px solid ${colors.textMediumGrey};
      color: ${colors.textMediumGrey};
    }

    &:checked + label {
      background-color: ${colors.textMediumGrey};
    }
  }
  `}
`

export function RadioButtonGroup<T extends string | undefined>({
  value,
  options,
  onChange,
  onBlur,
  disabled = false,
  ariaLabel,
  name = ''
}: {
  ariaLabel?: string
  value?: T
  disabled?: boolean
  options: { value?: T; label: string }[]
  onChange: (value?: T) => void
  onBlur?: () => void
  name?: string
}) {
  const [selected, setSelected] = useState(value || options[0].value)

  useEffect(() => {
    onChange(selected)
  }, [selected])

  return (
    <Group role="radiogroup" aria-label={ariaLabel} onBlur={onBlur} disabled={disabled}>
      {options.map(({ value, label }, index) => (
        <Fragment key={index}>
          <input
            type="radio"
            className="radio-button"
            name={`radioButton-${name}`}
            value={value}
            id={`button-${name}-${index}`}
            autoComplete="off"
            checked={selected === value}
            onChange={() => setSelected(value)}
            disabled={disabled}
          />

          <label aria-checked="false" htmlFor={`button-${name}-${index}`}>{label}</label>
        </Fragment>
      ))}
    </Group>
  )
}
