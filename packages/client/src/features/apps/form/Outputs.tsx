import { useEffect } from 'react'
import {
  type Control,
  type FieldArrayWithId,
  type FieldErrors,
  type UseFormGetValues,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormTrigger,
  type UseFormWatch,
  useFieldArray,
} from 'react-hook-form'
import { TransparentButton } from '../../../components/Button'
import { InputText } from '../../../components/InputText'
import { CrossIcon } from '../../../components/icons/PlusIcon'
import type { CreateAppForm, IOSpec } from '../apps.types'
import {
  SectionTitle,
  SectionTitleRow,
  StyledClassTd,
  StyledInputOutputBox,
  StyledRemove,
  TableStyles,
} from './apps-form.styles'
import { filledNamePaths, removeArrayStringFromClassType, setClassVal } from './common'
import { OutputFields, SelectIOClass } from './Fields'

interface OutputSpecRow {
  watch: UseFormWatch<CreateAppForm>
  register: UseFormRegister<CreateAppForm>
  control: Control<CreateAppForm>
  errors: FieldErrors<CreateAppForm>
  index: number
  remove: (index?: number | number[] | undefined) => void
  field: FieldArrayWithId<CreateAppForm, 'output_spec', 'id'>
  trigger: UseFormTrigger<CreateAppForm>
  setValue: UseFormSetValue<CreateAppForm>
  getValues: UseFormGetValues<CreateAppForm>
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
  getValues,
  remove,
}: OutputSpecRow) => {
  const sClass = watch(`output_spec.${index}.class`)
  const isArray = watch(`output_spec.${index}.isArray`)

  // keep the stored class in sync with the 'isArray' toggle
  useEffect(() => {
    setValue(`output_spec.${index}.class`, setClassVal(sClass, Boolean(isArray)))
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
        trigger={trigger}
        getValues={getValues}
      />

      <td>
        <StyledRemove>
          <TransparentButton
            type="button"
            onClick={() => {
              remove(index)
              // removing a row can resolve a duplicate name flagged on another row
              const paths = filledNamePaths('output_spec', getValues('output_spec'))
              if (paths.length > 0) {
                void trigger(paths)
              }
            }}
          >
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
  getValues: UseFormGetValues<CreateAppForm>
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
        <SelectIOClass addRow={addOutput} testId="add-output-button">
          Add Output
        </SelectIOClass>
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
                <OutputSpecRow key={field.id} index={index} field={field} remove={outputs.remove} {...props} />
              ))}
            </tbody>
          </table>
        )}
      </TableStyles>
    </StyledInputOutputBox>
  )
}
