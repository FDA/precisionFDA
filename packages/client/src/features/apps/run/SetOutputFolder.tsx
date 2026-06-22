import { type Control, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { AppSpec, RunJobFormType } from '../apps.types'

const filesOutputClasses = ['file', 'array:file']
const hasAppFileOutputs = (outputSpec: AppSpec['output_spec']): boolean => {
  return outputSpec.some(item => filesOutputClasses.includes(item.class))
}

/**
 * SetOutputFolder component will present a section to set the
 * output folder for apps that have file outputs.
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
  const render = hasAppFileOutputs(spec.outputSpec)

  return render ? (
    <Controller
      name="outputFolderPath"
      control={control}
      render={({ field }) => (
        <FieldSet
          className="mb-6 min-w-0 max-w-full gap-0 overflow-x-clip rounded-md border border-border p-0"
          data-testid="run-app-output-folder-section"
          aria-labelledby="run-app-output-folder-section-title"
        >
          <div
            id="run-app-output-folder-section-title"
            className="w-full min-w-0 min-h-[40px] content-center border-b border-border bg-muted-foreground/5 px-3 py-1.5 text-left text-sm font-bold normal-case text-muted-foreground"
          >
            Output Folder
          </div>
          <FieldGroup className="w-full min-w-0 gap-0! px-3 py-2 sm:px-4 sm:py-2.5">
            <Field className="gap-1.5">
              <FieldLabel className="w-full" htmlFor="output_folder_path">
                Store outputs in
              </FieldLabel>
              <FieldContent>
                <div className="flex min-w-0 flex-wrap items-stretch gap-2 sm:flex-nowrap">
                  <Input
                    id="output_folder_path"
                    className="min-w-0 flex-1"
                    data-testid="output_folder"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={isSubmitting}
                  />
                  <Button
                    className="shrink-0"
                    variant="outline"
                    data-testid="run-app-choose-folder-button"
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setShowModal(true)
                    }}
                  >
                    Choose folder
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Note: non-existing folders will be created.</p>
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldSet>
      )}
    />
  ) : null
}
