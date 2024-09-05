/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect } from 'react'
import {
  Control,
  FieldArrayWithId,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormTrigger,
  UseFormWatch,
  useFieldArray,
} from 'react-hook-form'
import { TransparentButton } from '../../../components/Button'
import { InputText } from '../../../components/InputText'
import { CrossIcon } from '../../../components/icons/PlusIcon'
import {
  BooleanInput,
  FileInput,
  FloatInput,
  IntInput,
  SelectIOClass,
  SpecProps,
  StringInput,
} from './Fields'
import { SectionTitle, SectionTitleRow, StyledClassTd, StyledInputOutputBox, StyledRemove, TableStyles } from './styles'
import { CreateAppForm, IOSpec } from '../apps.types'
import { removeArrayStringFromClassType, setClassVal } from './common'


interface InputSpecRowProps {
  watch: UseFormWatch<CreateAppForm>
  register: UseFormRegister<CreateAppForm>
  control: Control<CreateAppForm>
  errors: FieldErrors<CreateAppForm>
  index: number
  remove: (index?: number | number[] | undefined) => void
  field: FieldArrayWithId<CreateAppForm, 'input_spec', 'id'>
  trigger: UseFormTrigger<CreateAppForm>
  setValue: UseFormSetValue<CreateAppForm>
}

const InputSpecRow = ({
  index,
  watch,
  field,
  control,
  errors,
  register,
  remove,
  trigger,
  setValue,
}: InputSpecRowProps) => {
  const sClass = watch(`input_spec.${index}.class`)
  const isArray = watch(`input_spec.${index}.isArray`)

  // trigger validations on 'default' if 'isArray' changes
  useEffect(() => {
    trigger(`input_spec.${index}.default`)
    setValue(`input_spec.${index}.default`, null)
    setValue(`input_spec.${index}.class`, setClassVal(sClass, isArray))
  }, [isArray])

  // trigger validations on 'default' if 'choices' changes
  useEffect(() => {
    trigger(`input_spec.${index}.default`)
  }, [watch(`input_spec.${index}.choices`)])

  const baseProps = {
    base: 'input_spec',
    sClass,
    errors,
    control,
    index,
    register,
  } satisfies SpecProps

  return (
    <tr key={field.id}>
      <StyledClassTd>
        <InputText disabled value={removeArrayStringFromClassType(sClass)} />
      </StyledClassTd>

      {(sClass === 'string' || sClass === 'array:string') && (
        <StringInput {...baseProps} />
      )}
      {(sClass === 'file' || sClass === 'array:file') && (
        <FileInput {...baseProps} />
      )}
      {(sClass === 'int' || sClass === 'array:int') && (
        <IntInput {...baseProps} />
      )}
      {sClass === 'boolean' && (
        <BooleanInput {...baseProps} />
      )}
      {(sClass === 'float' || sClass === 'array:float') && (
        <FloatInput {...baseProps} />
      )}
      <td>
        <StyledRemove>
          <TransparentButton title="remove row" type="button" onClick={() => remove(index)}>
            <CrossIcon height={12} />
          </TransparentButton>
        </StyledRemove>
      </td>
    </tr>
  )
}

interface InputProps {
  watch: UseFormWatch<CreateAppForm>
  register: UseFormRegister<CreateAppForm>
  control: Control<CreateAppForm>
  errors: FieldErrors<CreateAppForm>
  trigger: UseFormTrigger<CreateAppForm>
  setValue: UseFormSetValue<CreateAppForm>
}

export const Inputs = (props: InputProps) => {
  const { control } = props
  const inputs = useFieldArray({
    control,
    name: 'input_spec',
  })
  const addInput = (c: IOSpec['class']) => {
    inputs.append({ class: c, isArray: false, name: '', label: '', help: '', default: null, choices: null, optional: false })
  }

  return (
    <StyledInputOutputBox>
      <SectionTitleRow>
        <SectionTitle>Inputs</SectionTitle>
        <SelectIOClass addRow={addInput}>
          Add Input
        </SelectIOClass>
      </SectionTitleRow>
      <TableStyles>
      {inputs?.fields?.length === 0 && (
        <div>No input defined</div>
      )}
      {inputs.fields.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Class</th>
              <th>Array?</th>
              <th>Name</th>
              <th>Label</th>
              <th>Help</th>
              <th>Default</th>
              <th>Choices</th>
              <th>Optional?</th>
            </tr>
          </thead>
          <tbody>
            {inputs.fields.map((field, index) => (
              <InputSpecRow
                key={field.id}
                index={index}
                field={field}
                remove={inputs.remove}
                {...props}
              />
            ))}
          </tbody>
        </table>
      )}
      </TableStyles>
    </StyledInputOutputBox>
  )
}
