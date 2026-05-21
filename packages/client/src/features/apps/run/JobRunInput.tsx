import { useQuery } from '@tanstack/react-query'
import { XIcon } from 'lucide-react'
import type { RefCallback } from 'react'
import { useEffect, useState } from 'react'
import {
  type FieldErrors,
  type FieldPath,
  type FieldValues,
  type UseFormSetError,
  useFormContext,
} from 'react-hook-form'
import { BoolButton, BoolButtonGroup } from '@/components/Button/BoolButtons'
import { FieldInfo } from '@/components/form/FieldInfo'
import { InputText } from '@/components/InputText'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox'
import { FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import { noAccessText } from '../../files/file.utils'
import type { InputSpec, IOSpec, RunJobFormType } from '../apps.types'
import { isFloatValid, isStrictlyInteger } from '../form/common'
import { SelectMultiFileInput } from '../SelectMultiFileInput'
import { ErrorMessageForField } from './ErrorMessageForField'
import { validateFile } from './utils'

type SelectOption = { label: string; value: string }
type ControlledField = {
  name: FieldPath<RunJobFormType>
  value: unknown
  onChange: (...event: unknown[]) => void
  onBlur: () => void
  ref: RefCallback<HTMLInputElement>
}

const getChoiceOptions = (choices: InputSpec['choices']) =>
  Array.isArray(choices) ? choices.map(value => ({ value: String(value), label: String(value) })) : []

const getStringValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null
  return String(value)
}

const getArrayValues = (value: unknown) =>
  Array.isArray(value) ? value.map(item => getStringValue(item)).filter((item): item is string => item !== null) : []

const getArrayInputError = (sclass: IOSpec['class'], inputValue: string, currentValues: string[]) => {
  if (inputValue.length === 0) {
    return null
  }

  switch (sclass) {
    case 'array:float':
      if (!isFloatValid(inputValue)) {
        return 'The value provided must be of type float'
      }
      break
    case 'array:int':
      if (!isStrictlyInteger(inputValue)) {
        return 'The value provided must be of type int'
      }
      break
    default:
      break
  }

  if (currentValues.includes(inputValue)) {
    return 'The current value is already provided in the list'
  }

  return null
}

const getArrayInputMessage = (sclass: IOSpec['class'], inputValue: string, currentValues: string[]) => {
  const error = getArrayInputError(sclass, inputValue, currentValues)
  if (error) {
    return error
  }
  if (inputValue.length > 0) {
    return 'Press enter to add value'
  }
  return 'Type to add new value'
}

const ChoiceInput = ({
  disabled,
  field,
  options,
}: {
  disabled: boolean
  field: ControlledField
  options: SelectOption[]
}) => {
  const currentValue = getStringValue(field.value)
  const currentOption = currentValue
    ? (options.find(option => option.value === currentValue) ?? { value: currentValue, label: currentValue })
    : null
  const items =
    currentOption && !options.some(option => option.value === currentOption.value)
      ? [currentOption, ...options]
      : options

  return (
    <Combobox<SelectOption>
      id={field.name}
      name={field.name}
      items={items}
      value={currentOption}
      onValueChange={next => {
        field.onChange(next?.value ?? null)
        field.onBlur()
      }}
      isItemEqualToValue={(a, b) => a.value === b.value}
      disabled={disabled}
      inputRef={field.ref}
    >
      <ComboboxInput placeholder="Choose..." disabled={disabled} onBlur={field.onBlur} />
      <ComboboxContent side="bottom" align="start">
        <ComboboxEmpty>No options match.</ComboboxEmpty>
        <ComboboxList>
          {(item: SelectOption) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

const ChoiceArrayInput = ({
  disabled,
  field,
  options,
}: {
  disabled: boolean
  field: ControlledField
  options: SelectOption[]
}) => {
  const anchorRef = useComboboxAnchor()
  const currentValues = getArrayValues(field.value)
  const currentOptions = currentValues.map(
    value => options.find(option => option.value === value) ?? { value, label: value },
  )
  const items = [...options]
  for (const option of currentOptions) {
    if (!items.some(item => item.value === option.value)) {
      items.push(option)
    }
  }

  return (
    <Combobox<SelectOption, true>
      multiple
      id={field.name}
      name={field.name}
      items={items}
      value={currentOptions}
      onValueChange={next => {
        field.onChange(next.map(item => item.value))
        field.onBlur()
      }}
      isItemEqualToValue={(a, b) => a.value === b.value}
      disabled={disabled}
    >
      <ComboboxChips ref={anchorRef} className="w-full">
        <ComboboxValue>
          {(selectedOptions: SelectOption[]) => (
            <>
              {selectedOptions.map(option => (
                <ComboboxChip key={option.value}>{option.label}</ComboboxChip>
              ))}
              <ComboboxChipsInput
                ref={field.ref}
                placeholder={selectedOptions.length === 0 ? 'Choose...' : undefined}
                disabled={disabled}
                onBlur={field.onBlur}
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent side="bottom" align="start" anchor={anchorRef}>
        <ComboboxEmpty>No options match.</ComboboxEmpty>
        <ComboboxList>
          {(item: SelectOption) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

const FreeformArrayInput = ({
  disabled,
  field,
  sclass,
}: {
  disabled: boolean
  field: ControlledField
  sclass: Extract<IOSpec['class'], 'array:string' | 'array:int' | 'array:float'>
}) => {
  const [inputValue, setInputValue] = useState('')
  const currentValues = getArrayValues(field.value)
  const error = getArrayInputError(sclass, inputValue, currentValues)
  const canAddValue = inputValue.length > 0 && !error

  const addValue = () => {
    if (!canAddValue) {
      return
    }

    field.onChange([...currentValues, inputValue])
    field.onBlur()
    setInputValue('')
  }

  return (
    <>
      <div
        className={cn(
          'rounded-md border border-input bg-transparent px-2.5 py-2 shadow-xs transition-[color,box-shadow] focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/30 dark:bg-input/30',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        {currentValues.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {currentValues.map(value => (
              <span
                key={value}
                className="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-1 text-xs font-medium text-foreground"
              >
                <span>{value}</span>
                <button
                  type="button"
                  className="rounded-xs opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-none"
                  onClick={() => {
                    field.onChange(currentValues.filter(item => item !== value))
                    field.onBlur()
                  }}
                  disabled={disabled}
                  aria-label={`Remove ${value}`}
                >
                  <XIcon className="size-3" />
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <Input
            ref={field.ref}
            value={inputValue}
            disabled={disabled}
            onChange={e => setInputValue(e.target.value)}
            onBlur={field.onBlur}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addValue()
              }
            }}
            placeholder={currentValues.length > 0 ? 'Add another value' : 'Type a value'}
            className="h-auto min-w-20 flex-1 border-0 bg-transparent px-0 py-0 shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
          />
          <Button type="button" size="xs" variant="outline" disabled={disabled || !canAddValue} onClick={addValue}>
            Add
          </Button>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{getArrayInputMessage(sclass, inputValue, currentValues)}</p>
    </>
  )
}

/**
 * Private apps need to be able to run with public files and public apps
 * need to be able to run with private files.
 *
 * @param scope
 */
const enhanceScope = (scope: string) => {
  return ['public', 'private'].includes(scope) ? ['private', 'public'] : [scope, 'public']
}

/** Reads validation for this path via RHF context (works for nested paths like inputs.0.fields.x). Requires FormProvider. */
function FileFieldMessage({ name }: { name: FieldPath<FieldValues> }) {
  const { getFieldState, formState } = useFormContext<FieldValues>()
  const { error, isTouched } = getFieldState(name, formState)
  return error?.message && (isTouched || formState.isSubmitted) ? <FieldError>{error.message}</FieldError> : null
}

const ArrayFileInput = ({
  disabled,
  field,
  scope,
  inputSpec,
  setError,
  validatedFilesCache,
}: {
  inputSpec: InputSpec
  field: ControlledField
  setError: UseFormSetError<RunJobFormType>
  disabled: boolean
  scope: string
  validatedFilesCache: Record<string, boolean>
}) => {
  const { setValue } = useFormContext<FieldValues>()
  const fileUids = getArrayValues(field.value)
  const areAllFilesPreValidated = fileUids.every(fileUid => validatedFilesCache[fileUid])

  const fileListQuery = useQuery({
    queryFn: () => Promise.all(fileUids.map(uid => validateFile(uid))),
    queryKey: ['user-list-files', fileUids],
    enabled: fileUids.length > 0 && !areAllFilesPreValidated,
  })

  const allFilesValidated = fileListQuery?.data?.every((isValid: boolean) => isValid) ?? false
  const error = fileUids.length > 0 && !areAllFilesPreValidated && fileListQuery.isSuccess && !allFilesValidated

  useEffect(() => {
    if (error) {
      setError(field.name, { type: 'custom', message: noAccessText.multi })
    }
  }, [error, setError, field.name])

  return (
    <>
      <SelectMultiFileInput
        dialogType="checkbox"
        dialogTitle="Select input files"
        disabled={disabled}
        onChange={value => {
          setValue(field.name as FieldPath<FieldValues>, value?.map(v => v.uid) ?? null, {
            shouldValidate: true,
            shouldTouch: true,
          })
        }}
        value={fileUids.length > 0 ? fileUids : undefined}
        scopes={enhanceScope(scope)}
      />

      <FieldInfo text={inputSpec.help} />
      <FileFieldMessage name={field.name as FieldPath<FieldValues>} />
    </>
  )
}

const SingleFileInput = ({
  disabled,
  field,
  scope,
  inputSpec,
  setError,
  validatedFilesCache,
}: {
  inputSpec: InputSpec
  field: ControlledField
  setError: UseFormSetError<RunJobFormType>
  disabled: boolean
  scope: string
  validatedFilesCache: Record<string, boolean>
}) => {
  const { setValue } = useFormContext<FieldValues>()
  const fileUid = getStringValue(field.value)
  const hasValue = !!fileUid && fileUid.length > 0
  const isSuccessfullyPreValidated = fileUid ? validatedFilesCache[fileUid] : false

  const fileListQuery = useQuery({
    queryFn: () => (fileUid ? validateFile(fileUid) : Promise.resolve(false)),
    queryKey: ['user-list-files', fileUid],
    enabled: !!fileUid && fileUid.length > 0 && !isSuccessfullyPreValidated,
  })

  const error = hasValue && fileListQuery.isSuccess && !(isSuccessfullyPreValidated || fileListQuery?.data)

  useEffect(() => {
    if (error) {
      setError(field.name, { type: 'custom', message: noAccessText.single })
    }
  }, [error, setError, field.name])

  return (
    <>
      <SelectMultiFileInput
        dialogTitle="Select input file"
        disabled={disabled}
        onChange={value => {
          setValue(field.name as FieldPath<FieldValues>, value?.[0].uid ?? null, {
            shouldValidate: true,
            shouldTouch: true,
          })
        }}
        dialogType="radio"
        value={fileUid ? [fileUid] : undefined}
        scopes={enhanceScope(scope)}
      />

      <FieldInfo text={inputSpec.help} />
      <FileFieldMessage name={field.name as FieldPath<FieldValues>} />
    </>
  )
}

export const JobRunInput = ({
  inputSpec,
  field,
  errors,
  disabled,
  scope,
  setError,
  validatedFilesCache,
}: {
  inputSpec: InputSpec
  field: ControlledField
  errors: FieldErrors<Record<string, unknown>>
  disabled: boolean
  setError: UseFormSetError<RunJobFormType>
  scope: string
  validatedFilesCache?: Record<string, boolean>
}) => {
  const choices = Array.isArray(inputSpec?.choices) ? inputSpec.choices : null
  const choiceOptions = getChoiceOptions(choices)

  switch (inputSpec.class) {
    case 'file': {
      return (
        <SingleFileInput
          setError={setError}
          disabled={disabled}
          field={field}
          inputSpec={inputSpec}
          scope={scope}
          validatedFilesCache={validatedFilesCache || {}}
        />
      )
    }
    case 'array:file': {
      return (
        <ArrayFileInput
          setError={setError}
          disabled={disabled}
          field={field}
          inputSpec={inputSpec}
          scope={scope}
          validatedFilesCache={validatedFilesCache || {}}
        />
      )
    }
    case 'string': {
      return (
        <>
          {choices ? (
            <ChoiceInput disabled={disabled} field={field} options={choiceOptions} />
          ) : (
            <InputText
              type="text"
              name={field.name}
              value={getStringValue(field.value) ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              disabled={disabled}
            />
          )}
          <FieldInfo text={inputSpec.help} />
          <ErrorMessageForField errors={errors} fieldName={field.name} />
        </>
      )
    }
    case 'array:string': {
      return (
        <>
          {choices ? (
            <ChoiceArrayInput disabled={disabled} field={field} options={choiceOptions} />
          ) : (
            <FreeformArrayInput disabled={disabled} field={field} sclass={inputSpec.class} />
          )}
          <FieldInfo text={inputSpec.help} />
          <ErrorMessageForField errors={errors} fieldName={field.name} />
        </>
      )
    }
    case 'int': {
      return (
        <>
          {choices ? (
            <ChoiceInput disabled={disabled} field={field} options={choiceOptions} />
          ) : (
            <InputText
              type="text"
              name={field.name}
              value={getStringValue(field.value) ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              disabled={disabled}
            />
          )}
          <FieldInfo text={inputSpec.help} />
          <ErrorMessageForField errors={errors} fieldName={field.name} />
        </>
      )
    }
    case 'array:int': {
      return (
        <>
          {choices ? (
            <ChoiceArrayInput disabled={disabled} field={field} options={choiceOptions} />
          ) : (
            <FreeformArrayInput disabled={disabled} field={field} sclass={inputSpec.class} />
          )}
          <FieldInfo text={inputSpec.help} />
          <ErrorMessageForField errors={errors} fieldName={field.name} />
        </>
      )
    }
    case 'float': {
      return (
        <>
          {choices ? (
            <ChoiceInput disabled={disabled} field={field} options={choiceOptions} />
          ) : (
            <InputText
              type="text"
              name={field.name}
              value={getStringValue(field.value) ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              disabled={disabled}
            />
          )}
          <FieldInfo text={inputSpec.help} />
          <ErrorMessageForField errors={errors} fieldName={field.name} />
        </>
      )
    }
    case 'array:float': {
      return (
        <>
          {choices ? (
            <ChoiceArrayInput disabled={disabled} field={field} options={choiceOptions} />
          ) : (
            <FreeformArrayInput disabled={disabled} field={field} sclass={inputSpec.class} />
          )}
          <FieldInfo text={inputSpec.help} />
          <ErrorMessageForField errors={errors} fieldName={field.name} />
        </>
      )
    }
    case 'boolean': {
      const val = field.value?.toString()
      return (
        <>
          <BoolButtonGroup>
            <BoolButton
              type="button"
              data-selected={(val === 'true').toString() as BooleanString}
              onClick={() => {
                field.onChange(val === 'true' ? null : 'true')
                field.onBlur()
              }}
            >
              True
            </BoolButton>

            <BoolButton
              type="button"
              data-selected={(val === 'false').toString() as BooleanString}
              onClick={() => {
                field.onChange(val === 'false' ? null : 'false')
                field.onBlur()
              }}
            >
              False
            </BoolButton>
          </BoolButtonGroup>
          <FieldInfo text={inputSpec.help} />
          <ErrorMessageForField errors={errors} fieldName={field.name} />
        </>
      )
    }
    default: {
      return <div>`ERROR: Unknown type of input class ${inputSpec.class}`</div>
    }
  }
}
