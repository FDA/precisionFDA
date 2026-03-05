import { Control, Controller } from 'react-hook-form'
import { Button } from '../../../components/Button'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { AppSpec, RunJobFormType } from '../apps.types'
import { InputTextRightMargin, Section, SectionBody, SectionHeader, StyledLabel } from './styles'

const filesOutputClasses = ['file', 'array:file']
const hasAppFileOutputs = (outputSpec: AppSpec['output_spec']): boolean => {
  return outputSpec.some(item => filesOutputClasses.includes(item.class))
}

/**
 * SetOutputFolder component will present a section to set the
 * output folder for apps that have file outputs.
 *
 * @constructor
 */
export const SetOutputFolder = ({
  control,
  isSubmitting,
  spec,
  setShowModal,
}: {
  control: Control<RunJobFormType, unknown, unknown>
  isSubmitting: boolean
  spec: AppSpec
  setShowModal: (val: boolean) => void
}) => {
  const render = hasAppFileOutputs(spec.output_spec)

  return render ? (
    <Controller
      name="outputFolderPath"
      control={control}
      render={({ field }) => (
        <Section>
          <SectionHeader>OUTPUT FOLDER</SectionHeader>
          <SectionBody>
            <FieldGroup label="Store outputs in">
              <InputTextRightMargin
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={isSubmitting}
                data-testid="output_folder"
              />
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setShowModal(true)
                }}
              >
                Choose folder
              </Button>
            </FieldGroup>
            <StyledLabel>Note: Non existing folders will be created</StyledLabel>
          </SectionBody>
        </Section>
      )}
    />
  ) : null
}
