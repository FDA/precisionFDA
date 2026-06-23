import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { type ReactNode, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/Button'
import { FieldGroup } from '@/components/form/FieldGroup'
import { InputError } from '@/components/form/form.styles'
import { RadioButtonGroup } from '@/components/form/RadioButtonGroup'
import { InputText, InputTextArea } from '@/components/InputText'
import { NavigationBlockerDialog } from '@/components/NavigationBlockerDialog'
import { FieldSet } from '@/components/ui/field'
import { useMutationErrorEffect } from '@/hooks/useMutationErrorEffect'
import { useNavigationBlocker } from '@/hooks/useNavigationBlocker'
import type { MutationErrors } from '@/types/utils'
import { proposeValidationSchema } from './common'

export interface ProposeChallengeFormValues {
  name: string
  email: string
  organisation: string
  specificQuestion: boolean
  specificQuestionText: string
  dataDetails: boolean
  dataDetailsText: string
}

// Smoothly expand/collapse a conditional section (0.5s). Uses the grid-rows
// 0fr->1fr technique so it animates to the content's natural height; `inert`
// keeps the collapsed content out of tab order and assistive tech.
const Collapsible = ({ open, children }: { open: boolean; children: ReactNode }) => (
  <div
    inert={!open}
    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
      open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
    }`}
  >
    <div className="overflow-hidden">{children}</div>
  </div>
)

export const ProposeChallengeForm = ({
  onSubmit,
  mutationErrors,
  pending = false,
}: {
  onSubmit: (a: ProposeChallengeFormValues) => Promise<void>
  mutationErrors?: MutationErrors
  pending?: boolean
}) => {
  const {
    control,
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<ProposeChallengeFormValues>({
    mode: 'onBlur',
    resolver: yupResolver(proposeValidationSchema),
    defaultValues: {
      name: '',
      email: '',
      organisation: '',
      dataDetails: true,
      dataDetailsText: '',
      specificQuestion: true,
      specificQuestionText: '',
    },
  })

  const hasQuestion = watch('specificQuestion')
  const hasData = watch('dataDetails')
  const isBusy = isSubmitting || pending

  // Clear a conditional text field (and its error) when its toggle is false.
  const clearTextWhenFalse = (answer: boolean, textField: 'specificQuestionText' | 'dataDetailsText') => {
    if (!answer) {
      setValue(textField, '')
      clearErrors([textField])
    }
  }

  useEffect(() => {
    clearTextWhenFalse(hasQuestion, 'specificQuestionText')
  }, [hasQuestion])
  useEffect(() => {
    clearTextWhenFalse(hasData, 'dataDetailsText')
  }, [hasData])

  useMutationErrorEffect(setError, mutationErrors)

  const blocker = useNavigationBlocker(Object.keys(dirtyFields).length > 0, isSubmitting)

  return (
    <form className="flex w-full flex-col gap-4 sm:max-w-125" onSubmit={handleSubmit(onSubmit)}>
      <FieldSet
        className="min-w-0 max-w-full gap-0 overflow-x-clip rounded-lg border border-layout-border bg-(--tertiary-30) p-0 shadow-sm"
        aria-labelledby="propose-challenge-section-title"
      >
        <div
          id="propose-challenge-section-title"
          className="w-full min-w-0 min-h-10 content-center border-b border-layout-border bg-muted-foreground/5 px-4 py-2 text-left text-sm font-bold normal-case text-muted-foreground"
        >
          PrecisionFDA Challenge Inquiry
        </div>
        <div className="flex w-full min-w-0 flex-col gap-6 px-4 py-5 sm:px-5">
          <FieldGroup label="Name" required>
            <InputText
              placeholder="Enter your name"
              autoFocus
              autoComplete="name"
              {...register('name')}
              disabled={isBusy}
            />
            <ErrorMessage errors={errors} name="name" render={({ message }) => <InputError>{message}</InputError>} />
          </FieldGroup>

          <FieldGroup label="Contact email" required>
            <InputText
              placeholder="Enter your contact email"
              inputMode="email"
              autoComplete="email"
              {...register('email')}
              disabled={isBusy}
            />
            <ErrorMessage errors={errors} name="email" render={({ message }) => <InputError>{message}</InputError>} />
          </FieldGroup>

          <FieldGroup label="Organisation / Institute">
            <InputText
              placeholder="Enter your organisation / institute"
              autoComplete="organization"
              {...register('organisation')}
              disabled={isBusy}
            />
            <ErrorMessage
              errors={errors}
              name="organisation"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <div>
            <FieldGroup label="Do you have a specific scientific question driving the challenge?">
              <Controller
                name="specificQuestion"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                  <RadioButtonGroup
                    name="specificQuestion"
                    ariaLabel="Do you have a specific scientific question driving the challenge?"
                    onChange={v => onChange(v === 'Yes')}
                    value={value ? 'Yes' : 'No'}
                    onBlur={onBlur}
                    options={[
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' },
                    ]}
                  />
                )}
              />
              <ErrorMessage
                errors={errors}
                name="specificQuestion"
                render={({ message }) => <InputError>{message}</InputError>}
              />
            </FieldGroup>
            <Collapsible open={hasQuestion}>
              <FieldGroup label="Please provide question details" className="pt-4">
                <InputTextArea
                  placeholder="Enter the question details"
                  disabled={isBusy}
                  {...register('specificQuestionText')}
                />
                <ErrorMessage
                  errors={errors}
                  name="specificQuestionText"
                  render={({ message }) => <InputError>{message}</InputError>}
                />
              </FieldGroup>
            </Collapsible>
          </div>

          <div>
            <FieldGroup label="Do you have access to data for the challenge?">
              <Controller
                name="dataDetails"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                  <RadioButtonGroup
                    name="dataDetails"
                    ariaLabel="Do you have access to data for the challenge?"
                    onChange={v => onChange(v === 'Yes')}
                    value={value ? 'Yes' : 'No'}
                    onBlur={onBlur}
                    options={[
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' },
                    ]}
                  />
                )}
              />
              <ErrorMessage
                errors={errors}
                name="dataDetails"
                render={({ message }) => <InputError>{message}</InputError>}
              />
            </FieldGroup>
            <Collapsible open={hasData}>
              <FieldGroup
                label="Please provide details about the data (e.g. data type, sample number, etc)"
                className="pt-4"
              >
                <InputTextArea
                  placeholder="Enter the data details"
                  disabled={isBusy}
                  {...register('dataDetailsText')}
                />
                <ErrorMessage
                  errors={errors}
                  name="dataDetailsText"
                  render={({ message }) => <InputError>{message}</InputError>}
                />
              </FieldGroup>
            </Collapsible>
          </div>
        </div>
      </FieldSet>

      <Button data-variant="primary" disabled={isBusy} type="submit" className="self-start">
        {isBusy ? 'Submitting…' : 'Submit Inquiry'}
      </Button>
      <NavigationBlockerDialog blocker={blocker} />
    </form>
  )
}
