/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect } from 'react'
import {
  Control,
  FieldArrayWithId,
  FieldErrors,
  UseFieldArrayUpdate,
  UseFormRegister,
  UseFormSetValue,
  UseFormTrigger,
  UseFormWatch,
  useFieldArray,
} from 'react-hook-form'
import { TransparentButton } from '../../../components/Button'
import { InputText } from '../../../components/InputText'
import { CrossIcon } from '../../../components/icons/PlusIcon'
import { OutputFields, SelectIOClass } from './Fields'
import {
  SectionTitle,
  SectionTitleRow,
  StyledClassTd,
  StyledInputOutputBox,
  StyledRemove,
  TableStyles,
} from './styles'
import { CreateAppForm, IOSpec } from '../apps.types'
import { removeArrayStringFromClassType, setClassVal } from './common'

interface OutputSpecRow {
  watch: UseFormWatch<CreateAppForm>
  register: UseFormRegister<CreateAppForm>
  control: Control<CreateAppForm>
  errors: FieldErrors<CreateAppForm>
  index: number
  remove: (index?: number | number[] | undefined) => void
  update: UseFieldArrayUpdate<CreateAppForm, 'output_spec'>
  field: FieldArrayWithId<CreateAppForm, 'output_spec', 'id'>
  trigger: UseFormTrigger<CreateAppForm>
  setValue: UseFormSetValue<CreateAppForm>
}

const OutputSpecRow = ({
  index,
  watch,
  field,
  control,
  errors,
  register,
  trigger,
  setValue,
  remove,
}: OutputSpecRow) => {
  const sClass = watch(`output_spec.${index}.class`)
  const isArray = watch(`output_spec.${index}.isArray`)

  // trigger validations on 'default' if 'isArray' changes
  useEffect(() => {
    trigger(`output_spec.${index}.default`)
    setValue(`output_spec.${index}.class`, setClassVal(sClass, isArray))
  }, [isArray])

  return (
    <tr key={field.id}>
      <StyledClassTd>
        <InputText disabled value={removeArrayStringFromClassType(field.class)} />
        {errors.output_spec?.[index]?.class && <p>This field is required</p>}
      </StyledClassTd>

      <OutputFields
        sClass={sClass}
        base="output_spec"
        errors={errors}
        control={control}
        index={index}
        register={register}
      />

      <td>
        <StyledRemove>
          <TransparentButton type="button" onClick={() => remove(index)}>
            <CrossIcon height={12} />
          </TransparentButton>
        </StyledRemove>
      </td>
    </tr>
  )
}

interface OutputProps {
  watch: UseFormWatch<CreateAppForm>
  register: UseFormRegister<CreateAppForm>
  control: Control<CreateAppForm>
  errors: FieldErrors<CreateAppForm>
  trigger: UseFormTrigger<CreateAppForm>
  setValue: UseFormSetValue<CreateAppForm>
}

export const Outputs = (props: OutputProps) => {
  const { control } = props
  const outputs = useFieldArray({
    control,
    name: 'output_spec',
  })
  const addOutput = (c: IOSpec['class']) => {
    outputs.append({
      class: c,
      isArray: false,
      name: '',
      label: '',
      help: '',
      optional: false,
    })
  }

  return (
    <StyledInputOutputBox>
      <SectionTitleRow>
        <SectionTitle>Outputs</SectionTitle>
        <SelectIOClass addRow={addOutput}>Add Output</SelectIOClass>
      </SectionTitleRow>
      <TableStyles>
        {outputs.fields.length === 0 && <div>No outputs defined</div>}
        {outputs.fields.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Class</th>
                <th>Array?</th>
                <th>Name</th>
                <th>Label</th>
                <th>Help</th>
                <th />
                <th>Optional?</th>
              </tr>
            </thead>
            <tbody>
              {outputs.fields.map((field, index) => (
                <OutputSpecRow
                  key={field.id}
                  index={index}
                  field={field}
                  remove={outputs.remove}
                  update={outputs.update}
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
