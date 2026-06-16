import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { FieldErrors } from 'react-hook-form'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { Button } from '@/components/Button'
import { FieldGroup } from '@/components/form/FieldGroup'
import { InputText } from '@/components/InputText'
import { Loader } from '@/components/Loader'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { FieldSet } from '@/components/ui/field'
import type { FormInput, InputSpec } from '@/features/apps/apps.types'
import { ErrorMessageForField } from '@/features/apps/run/ErrorMessageForField'
import { JobRunInput } from '@/features/apps/run/JobRunInput'
import { getValue, prepareValidationsForInputs, shouldIncludeInputValue } from '@/features/apps/run/utils'
import { Empty } from '@/features/home/home.styles'
import { ModalHeaderTop, ModalNext } from '@/features/modal/ModalNext'
import { Footer, ModalScrollAutoHeight, StyledForm } from '@/features/modal/modal.styles'
import { useModal } from '@/features/modal/useModal'
import { fetchChallengeApp, submitChallengeEntry } from '../api'
import type { Challenge } from '../types'

interface SubmitChallengeFormValues {
  name: string
  desc: string
  inputs: Record<string, FormInput>
}

const buildValidationSchema = (inputSpecs: InputSpec[]) =>
  Yup.object({
    name: Yup.string().required('Name is required').max(150, 'Name cannot be longer than 150 characters'),
    desc: Yup.string().required('Description is required'),
    inputs: Yup.object().shape(prepareValidationsForInputs(inputSpecs)),
  })

const SubmitChallengeModalContent = ({ challenge, hide }: { challenge: Challenge; hide: () => void }) => {
  const queryClient = useQueryClient()

  const {
    data: appData,
    isLoading: isLoadingApp,
    isError: isAppError,
  } = useQuery({
    queryKey: ['challenge-app', challenge.id, challenge.appUid],
    queryFn: () => fetchChallengeApp(challenge.id),
    enabled: !!challenge.id,
  })

  const inputSpecs: InputSpec[] = appData?.inputSpec ?? []

  const methods = useForm<SubmitChallengeFormValues>({
    resolver: yupResolver(buildValidationSchema(inputSpecs)) as never,
    defaultValues: { name: '', desc: '', inputs: {} },
  })

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = methods

  const submitMutation = useMutation<void, AxiosError<{ error?: string }>, SubmitChallengeFormValues>({
    mutationFn: async values => {
      const inputs: Record<string, FormInput> = {}
      for (const key of Object.keys(values.inputs)) {
        const value = getValue(key, values.inputs[key], inputSpecs)
        if (shouldIncludeInputValue(value)) {
          inputs[key] = value
        }
      }
      await submitChallengeEntry(challenge.id, {
        name: values.name,
        desc: values.desc,
        inputs: inputs as Record<string, string | number | boolean | string[]>,
      })
    },
    onSuccess: () => {
      toastSuccess('Your entry was submitted successfully.')
      queryClient.invalidateQueries({ queryKey: ['challenge-entries', challenge.id] })
      methods.reset()
      hide()
    },
    onError: error => {
      toastError(error?.response?.data?.error ?? 'Failed to submit entry. Please try again.')
    },
  })

  const onSubmit = handleSubmit(values => submitMutation.mutate(values))

  if (isLoadingApp) {
    return (
      <div className="flex min-h-50 items-center justify-center p-6">
        <Loader />
      </div>
    )
  }

  if (isAppError) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">
          Failed to load the challenge app configuration. Please close and try again.
        </p>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <ModalScrollAutoHeight>
        <StyledForm id="submit-challenge-entry-form" onSubmit={onSubmit}>
          <div className="min-w-0 max-w-full">
            <FieldSet
              className="mb-6 min-w-0 max-w-full gap-0 overflow-x-clip rounded-md border border-border p-0"
              aria-labelledby="submit-challenge-details-title"
            >
              <div
                id="submit-challenge-details-title"
                className="w-full min-w-0 min-h-10 content-center border-b border-border bg-muted-foreground/5 px-3 py-1.5 text-left text-sm font-bold normal-case text-muted-foreground"
              >
                Submission details
              </div>
              <div className="w-full min-w-0 space-y-3 px-3 py-2 sm:px-4 sm:py-2.5">
                <FieldGroup label="Name" required>
                  <InputText
                    {...register('name')}
                    placeholder="Name this submission…"
                    disabled={submitMutation.isPending}
                    data-variant={errors.name ? 'error' : undefined}
                  />
                  <ErrorMessageForField errors={errors as FieldErrors<Record<string, unknown>>} fieldName="name" />
                </FieldGroup>

                <FieldGroup label="Description" required>
                  <InputText
                    {...register('desc')}
                    placeholder="Describe your submission…"
                    disabled={submitMutation.isPending}
                    data-variant={errors.desc ? 'error' : undefined}
                  />
                  <ErrorMessageForField errors={errors as FieldErrors<Record<string, unknown>>} fieldName="desc" />
                </FieldGroup>
              </div>
            </FieldSet>

            <FieldSet
              className="mb-6 min-w-0 max-w-full gap-0 overflow-x-clip rounded-md border border-border p-0"
              aria-labelledby="submit-challenge-inputs-title"
            >
              <div
                id="submit-challenge-inputs-title"
                className="w-full min-w-0 min-h-10 content-center border-b border-border bg-muted-foreground/5 px-3 py-1.5 text-left text-sm font-bold normal-case text-muted-foreground"
              >
                Inputs
              </div>
              <div className="w-full min-w-0 space-y-2 px-3 py-2 sm:px-4 sm:py-2.5">
                {inputSpecs.length > 0 ? (
                  inputSpecs.map(spec => (
                    <FieldGroup key={spec.name} label={spec.label || spec.name} required={!spec.optional}>
                      <Controller
                        name={`inputs.${spec.name}`}
                        control={methods.control}
                        render={({ field }) => (
                          <JobRunInput
                            inputSpec={spec}
                            field={field as never}
                            errors={(errors.inputs ?? {}) as FieldErrors<Record<string, unknown>>}
                            disabled={submitMutation.isPending}
                            scope="private"
                            setError={setError as never}
                          />
                        )}
                      />
                    </FieldGroup>
                  ))
                ) : (
                  <Empty>App has no inputs.</Empty>
                )}
              </div>
            </FieldSet>
          </div>
        </StyledForm>
      </ModalScrollAutoHeight>

      <Footer>
        <Button type="button" onClick={hide} disabled={submitMutation.isPending}>
          Cancel
        </Button>
        <Button
          data-variant="primary"
          type="submit"
          form="submit-challenge-entry-form"
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? 'Submitting…' : 'Submit Entry'}
        </Button>
      </Footer>
    </FormProvider>
  )
}

export const useSubmitChallengeModal = (challenge: Challenge) => {
  const { isShown, setShowModal } = useModal()

  const modalComp = (
    <ModalNext
      id="submit-challenge-modal"
      headerText="Submit Challenge Entry"
      hide={() => setShowModal(false)}
      isShown={isShown}
      variant="medium"
    >
      <ModalHeaderTop headerText="Submit Challenge Entry" hide={() => setShowModal(false)} />
      <SubmitChallengeModalContent challenge={challenge} hide={() => setShowModal(false)} />
    </ModalNext>
  )

  return {
    modalComp,
    openModal: () => setShowModal(true),
    isShown,
  }
}
