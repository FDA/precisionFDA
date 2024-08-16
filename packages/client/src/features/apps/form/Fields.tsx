/* eslint-disable react/destructuring-assignment */
import { ErrorMessage } from '@hookform/error-message'
import { get } from 'lodash'
import React from 'react'
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form'
import { Tooltip } from 'react-tooltip'
import styled, { css } from 'styled-components'
import { Button } from '../../../components/Button'
import {
  BoolButton,
  BoolButtonGroup,
} from '../../../components/Button/BoolButtons'
import { DropdownNext } from '../../../components/Dropdown/DropdownNext'
import { StyledDropMenuLinks } from '../../../components/Header/styles'
import { InputText } from '../../../components/InputText'
import { InputError } from '../../../components/form/styles'
import { PlusIcon } from '../../../components/icons/PlusIcon'
import { theme } from '../../../styles/theme'
import { SelectMultiFileInput } from '../SelectMultiFileInput'
import { CreateAppForm, IOSpec } from '../apps.types'
import { formatCSVStringToArray, handleSnakeNameChange } from './common'
import { Checkbox } from '../../../components/CheckboxNext'

export const InputTextS = styled(InputText)<{ $isError?: boolean }>`
  ${({ $isError }) =>
    $isError &&
    css`
      border-color: #ff5040;
      &:focus {
        border-color: #ff5040;
        box-shadow: 0 0 0 2px rgba(255, 39, 24, 0.2);
      }
    `}
`

const DefaultBooleanTd = styled.td`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  height: 32px;

  label {
    display: flex;
    align-items: center;
    margin-left: 12px;

    input {
      margin: 0;
      margin-right: 4px;
    }
  }
`

const StyledItem = styled.div`
  cursor: pointer;
  width: auto;
  transition: color 0.3s ease;
  text-transform: uppercase;
  font-size: 13px;
  padding: 0 12px;
  line-height: 30px;
  &:hover {
    background-color: ${theme.colors.textLightGrey};
  }
`

const StyledIsArray = styled.td`
  width: 50px;
`
const CheckboxWrapLabel = styled.label`
  position: relative;
`

export interface SpecProps {
  base: 'input_spec' | 'output_spec'
  register: UseFormRegister<CreateAppForm>
  index: number
  control: Control<CreateAppForm>
  errors: FieldErrors<CreateAppForm>
  sClass?: IOSpec['class']
}

export interface OutputSpecProps extends SpecProps {
  sClass: IOSpec['class']
}

export const Name = ({ base, register, index, errors }: SpecProps) => {
  let message = ''
  let isError = false
  const e = get(errors, `${base}.${index}.name`)
  if (e) {
    message = e['message']
    isError = true
  }

  return (
    <td>
      <InputTextS
        {...register(`${base}.${index}.name`, {
          required: 'Name is required.',
          onChange: handleSnakeNameChange,
        })}
        data-tooltip-id={`${base}.${index}.name`}
        data-tooltip-content={message}
        placeholder={`Enter ${base === 'input_spec' ? 'input' : 'output'} name`}
        $isError={isError}
      />

      {isError && (
        <Tooltip id={`${base}.${index}.name`} />
      )}
    </td>
  )
}

export const Label = ({ base, register, index, errors }: SpecProps) => {
  const isError = Boolean(get(errors, `${base}.${index}.label`))
  const errorMessage = get(errors, `${base}.${index}.label`)?.message || null

  return (
    <td>
      <InputTextS
        {...register(`${base}.${index}.label`)}
        data-tooltip-id={`${base}.${index}.label`}
        data-tooltip-content={errorMessage}
        $isError={isError}
        placeholder={`Enter ${
          base === 'input_spec' ? 'input' : 'output'
        } label`}
      />
      {isError && (
        <Tooltip id={`${base}.${index}.label`} />
      )}
    </td>
  )
}

export const Help = ({ base, register, index, errors }: SpecProps) => {
  const isError = Boolean(get(errors, `${base}.${index}.help`))
  const errorMessage = get(errors, `${base}.${index}.help`)?.message || null

  return (
    <td>
      <InputTextS
        {...register(`${base}.${index}.help`)}
        data-tooltip-id={`${base}.${index}.help`}
        data-tooltip-content={errorMessage}
        $isError={isError}
        placeholder="Enter help text"
      />
      {isError && (
        <Tooltip id={`${base}.${index}.help`} />
      )}
    </td>
  )
}

export const DefaultString = ({ base, register, index, errors }: SpecProps) => {
  const isError = Boolean(get(errors, `${base}.${index}.default`))
  const errorMessage = get(errors, `${base}.${index}.default`)?.message || null

  return (
    <td>
      <InputTextS
        {...register(`${base}.${index}.default`, { setValueAs: formatCSVStringToArray })}
        data-tooltip-id={`${base}.${index}.default`}
        data-tooltip-content={errorMessage}
        $isError={isError}
        placeholder="Optional default"
      />
      {isError && (
        <Tooltip id={`${base}.${index}.default`} />
      )}
    </td>
  )
}

export const DefaultFloat = ({ base, register, index, errors }: SpecProps) => {
  const isError = Boolean(get(errors, `${base}.${index}.default`))
  const errorMessage = get(errors, `${base}.${index}.default`)?.message || null
  return (
    <td>
      <InputTextS
        data-tooltip-id={`${base}.${index}.default`}
        data-tooltip-content={errorMessage}
        placeholder="Optional default"
        $isError={isError}
        {...register(`${base}.${index}.default`, { setValueAs: formatCSVStringToArray })}
      />
      {isError && (
        <Tooltip id={`${base}.${index}.default`} />
      )}
    </td>
  )
}

export const DefaultInt = ({ base, register, index, errors }: SpecProps) => {
  const isError = Boolean(get(errors, `${base}.${index}.default`))
  const errorMessage = get(errors, `${base}.${index}.default`)?.message || null
  return (
    <td>
      <InputTextS
        data-tooltip-id={`${base}.${index}.default`}
        data-tooltip-content={errorMessage}
        placeholder="Optional default"
        $isError={isError}
        {...register(`${base}.${index}.default`, { setValueAs: formatCSVStringToArray })}
      />
      {isError && (
        <Tooltip id={`${base}.${index}.default`} />
      )}
    </td>
  )
}

export const DefaultFile = ({
  base,
  index,
  control,
  errors,
  sClass,
}: SpecProps) => {
  const isError = Boolean(get(errors, `${base}.${index}.default`))
  const errorMessage = get(errors, `${base}.${index}.default`)?.message || null

  return (
    <td data-tooltip-id={`${base}.${index}.default`} data-tooltip-content={errorMessage}>
      <Controller
        name={`${base}.${index}.default`}
        control={control}
        render={({ field }) => {
          return (
            <SelectMultiFileInput
              isError={isError}
              dialogType={sClass === 'file' ? 'radio' : 'checkbox'}
              dialogTitle="Select file input"
              onChange={value => {
                if (value && sClass === 'file') {
                  field.onChange(value[0].uid ?? null)
                } else {
                  field.onChange(value?.map(v => v.uid) ?? null)
                }
                field.onBlur()
              }}
              value={
                field.value && sClass === 'file' ? [field.value] : field.value
              }
            />
          )
        }}
      />
      {isError && (
        <Tooltip id={`input_spec.${index}.default`} />
      )}
    </td>
  )
}

export const DefaultBoolean = ({
  base,
  control,
  index,
  errors,
}: SpecProps) => {
  return (
    <DefaultBooleanTd>
      <Controller
        name={`${base}.${index}.default`}
        control={control}
        render={({ field }) => {
          return (
            <BoolButtonGroup>
              <BoolButton
                type="button"
                data-selected={(field.value === 'true').toString() as BooleanString}
                onClick={() =>
                  field.onChange(field.value === 'true' ? null : 'true')
                }
              >
                True
              </BoolButton>

              <BoolButton
                type="button"
                data-selected={(field.value === 'false').toString() as BooleanString}
                onClick={() =>
                  field.onChange(field.value === 'false' ? null : 'false')
                }
              >
                False
              </BoolButton>
            </BoolButtonGroup>
          )
        }}
      />

      <ErrorMessage
        errors={errors}
        name={`${base}.${index}.default`}
        render={({ message }) => <InputError>{message}</InputError>}
      />
    </DefaultBooleanTd>
  )
}

export const Choice = ({ base, register, index, errors }: SpecProps) => {
  const isError = Boolean(get(errors, `${base}.${index}.choices`))
  const errorMessage = get(errors, `${base}.${index}.choices`)?.message || null

  return (
    <td>
      <InputTextS
        data-tooltip-id={`${base}.${index}.choices`}
        data-tooltip-content={errorMessage}
        $isError={isError}
        {...register(`${base}.${index}.choices`, { setValueAs: formatCSVStringToArray })}
        placeholder="Optional comma separated values"
      />
      {isError && (
        <Tooltip id={`${base}.${index}.choices`} />
      )}
    </td>
  )
}

export const Optional = ({ base, index, control, errors }: SpecProps) => {
  const id = `${base}.${index}.optional`
  const isError = Boolean(get(errors, `${base}.${index}.optional`))
  const errorMessage = get(errors, `${base}.${index}.optional`)?.message || null
  return (
    <td>
      <Controller
        data-tooltip-id={id}
        data-tooltip-content={errorMessage}
        name={id}
        control={control}
        render={({ field }) => {
          return (
            <CheckboxWrapLabel id={id}>
              <Checkbox
                data-testid={`${id}-checkbox`}
                checked={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            </CheckboxWrapLabel>
          )
        }}
      />
      {isError && (
        <Tooltip id={id} />
      )}
    </td>
  )
}
export const IsArray = ({ base, index, control, errors }: SpecProps) => {
  const id = `${base}.${index}.isArray`
  const isError = Boolean(get(errors, id))
  const errorMessage = get(errors, id)?.message || null
  return (
    <StyledIsArray>
      <Controller
        data-tooltip-id={id}
        data-tooltip-content={errorMessage}
        name={id}
        control={control}
        render={({ field }) => {
          return (
            <CheckboxWrapLabel id={id}>
              <Checkbox
                data-testid={id+'-checkbox'}
                checked={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            </CheckboxWrapLabel>
          )
        }}
      />
      {isError && (
        <Tooltip id={id} />
      )}
    </StyledIsArray>
  )
}

export const StringInput = (props: SpecProps) => {
  return (
    <>
      <IsArray {...props} />
      <Name {...props} />
      <Label {...props} />
      <Help {...props} />
      <DefaultString {...props} />
      <Choice {...props} />
      <Optional {...props} />
    </>
  )
}

export const IntInput = (props: SpecProps) => {
  return (
    <>
      <IsArray {...props} />
      <Name {...props} />
      <Label {...props} />
      <Help {...props} />
      <DefaultInt {...props} />
      <Choice {...props} />
      <Optional {...props} />
    </>
  )
}

export const FileInput = (props: SpecProps) => {
  return (
    <>
      <IsArray {...props} />
      <Name {...props} />
      <Label {...props} />
      <Help {...props} />
      <DefaultFile {...props} />
      <td />
      <Optional {...props} />
    </>
  )
}

export const BooleanInput = (props: SpecProps) => {
  return (
    <>
      <td />
      <Name {...props} />
      <Label {...props} />
      <Help {...props} />
      <DefaultBoolean {...props} />
      <td />
      <Optional {...props} />
    </>
  )
}

export const FloatInput = (props: SpecProps) => {
  return (
    <>
      <IsArray {...props} />
      <Name {...props} />
      <Label {...props} />
      <Help {...props} />
      <DefaultFloat {...props} />
      <Choice {...props} />
      <Optional {...props} />
    </>
  )
}

export const OutputFields = (props: OutputSpecProps) => {
  return (
    <>
      {props.sClass === 'boolean' ? <td /> : <IsArray {...props} />}
      <Name {...props} />
      <Label {...props} />
      <Help {...props} />
      <td />
      <Optional {...props} />
    </>
  )
}

const StyledButton = styled(Button)`
  height: 32px;
  svg {
    margin-right: 4px;
    color: ${theme.colors.orange};
  }
`

export const SelectIOClass = ({
  addRow,
  children,
}: {
  addRow: (s: IOSpec['class']) => void
  children: React.ReactNode
}) => {
  return (
    <DropdownNext
      trigger="click"
      // eslint-disable-next-line react/no-unstable-nested-components
      content={(props, { hide }) => (
        <StyledDropMenuLinks
          data-testid="io-items">
          <StyledItem
            onClick={() => {
              hide()
              addRow('string')
            }}
          >
            string
          </StyledItem>
          <StyledItem
            onClick={() => {
              hide()
              addRow('file')
            }}
          >
            file
          </StyledItem>
          <StyledItem
            onClick={() => {
              hide()
              addRow('int')
            }}
          >
            int
          </StyledItem>
          <StyledItem
            onClick={() => {
              hide()
              addRow('float')
            }}
          >
            float
          </StyledItem>
          <StyledItem
            onClick={() => {
              hide()
              addRow('boolean')
            }}
          >
            boolean
          </StyledItem>
        </StyledDropMenuLinks>
      )}
    >
      {({ $isActive, ...props }) => (
        <StyledButton
          type="button"
          {...props}
          active={$isActive.toString() as BooleanString}
        >
          <PlusIcon height={12} />
          {children}
        </StyledButton>
      )}
    </DropdownNext>
  )
}
