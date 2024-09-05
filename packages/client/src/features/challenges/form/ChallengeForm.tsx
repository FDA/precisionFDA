/* eslint-disable jsx-a11y/label-has-associated-control */
import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import styled from 'styled-components'
import { unstable_usePrompt } from 'react-router-dom'

import { FieldGroup, FieldLabel, InputError } from '../../../components/form/styles'
import { InputDateTime, InputFile, InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { useMutationErrorEffect } from '../../../hooks/useMutationErrorEffect'
import { MutationErrors } from '../../../types/utils'
import { Challenge } from '../types'
import { ChallengeCreateUpdateModal } from './ChallengeCreateUpdateModal'
import { createValidationSchema, editValidationSchema } from './common'
import { GuestLeadUserSelect } from './GuestLeadUserSelect'
import { HostLeadUserSelect } from './HostLeadUserSelect'
import { ScopeFieldSelect } from './ScopeFieldSelect'
import { ScoringAppUserSelect } from './ScoringAppUserSelect'
import { StatusSelect } from './StatusSelect'
import { Button } from '../../../components/Button'

const StyledDateInput = styled(InputDateTime)`
  width: fit-content;
`

export interface IChallengeForm {
  name: string
  description: string
  scope: { label: string; value: string }
  app_owner_id: { label: string; value: string }
  start_at: Date
  end_at: Date
  host_lead_dxuser: { label: string; value: string }
  guest_lead_dxuser: { label: string; value: string }
  card_image_url: string
  card_image_id: string
  card_image_file: File[]
  status: { label: string; value: string }
  pre_registration_url: string
}

const StyledForm = styled.form`
  width: 100%;
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media (min-width: 640px) {
    max-width: 500px;
  }
`

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const ImageUploadPreview = styled.img`
  width: 100%;
  max-width: 214px;
  border-radius: 12px;
  height: 214px;
  object-fit: cover;
`

function getBase64(file?: File, callback?: (a: string | null) => void) {
  if (file) {
    const reader = new FileReader()
    reader.addEventListener(
      'load',
      () => callback && callback(reader.result as string),
    )
    reader.readAsDataURL(file)
  }
}

export const ChallengeForm = ({
  challenge,
  defaultValues = {},
  onSubmit,
  isSaving = false,
  mutationErrors,
}: {
  challenge?: Challenge
  defaultValues?: any
  onSubmit: (a: any) => Promise<any>
  isSaving?: boolean
  mutationErrors?: MutationErrors
}) => {
  const [base64Image, setBase64Image] = React.useState<string | null>(null)
  const isEditMode = !!challenge
  const ended = isEditMode
    ? new Date().getTime() > new Date(challenge.end_at).getTime()
    : false

  const {
    control,
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting, dirtyFields },
    trigger,
  } = useForm<IChallengeForm>({
    mode: 'onBlur',
    resolver: yupResolver(
      isEditMode ? editValidationSchema : createValidationSchema,
    ),
    defaultValues: {
      name: '',
      description: '',
      scope: null,
      app_owner_id: null,
      start_at: null,
      end_at: null,
      host_lead_dxuser: null,
      guest_lead_dxuser: null,
      card_image_file: null,
      card_image_url: null,
      card_image_id: null,
      status: null,
      pre_registration_url: '',
      ...defaultValues,
    },
  })

  useEffect(() => {
    const img = watch().card_image_file
    if (img?.[0] != null) {
      getBase64(img?.[0], setBase64Image)
    }
  }, [watch().card_image_file])

  useMutationErrorEffect(setError, mutationErrors)

  unstable_usePrompt({
    message: 'There are unsaved changes, are you sure you want to leave?',
    when: ({ currentLocation, nextLocation }: any) => 
      (!isSubmitting && Object.keys(dirtyFields).length > 0) &&
      currentLocation.pathname !== nextLocation.pathname,
  })

  return (
    <>
      <div>
        <StyledForm onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <FieldGroup>
            <label>Name (required)</label>
            <InputText
              placeholder="Name of the challenge"
              {...register('name')}
              disabled={isSubmitting}
            />
            <ErrorMessage
              errors={errors}
              name="name"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <FieldGroup>
            <label>Description</label>
            <InputText
              type="textarea"
              placeholder="What is this challenge about?"
              {...register('description')}
              disabled={isSubmitting}
            />
            <ErrorMessage
              errors={errors}
              name="description"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <FieldGroup>
            {base64Image ? (
              <ImageUploadPreview
                width={300}
                src={base64Image || undefined}
                alt="portal img"
              />
            ) : (
              defaultValues?.card_image_url && (
                <ImageUploadPreview
                  width={300}
                  src={defaultValues?.card_image_url}
                  alt="challenge img"
                />
              )
            )}

            <>
              <FieldLabel>
                Challenge image file
              </FieldLabel>
              <InputFile
                {...register('card_image_file')}
                type="file"
                accept="image/*"
                disabled={isSubmitting}
              />
              <ErrorMessage
                errors={errors}
                name="card_image_file"
                render={({ message }) => <InputError>{message}</InputError>}
              />
            </>
          </FieldGroup>

          <FieldGroup>
            <label>Scope (required)</label>
            <Controller
              name="scope"
              control={control}
              render={({ field: { onChange, onBlur, value }}) => (
                <ScopeFieldSelect
                  isSubmitting={isSubmitting}
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
            <ErrorMessage
              errors={errors}
              name="scope"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <FieldGroup>
            <label>Scoring App User (required)</label>
            <Controller
              name="app_owner_id"
              control={control}
              render={({ field: { value, onChange, onBlur }}) => (
                <ScoringAppUserSelect
                  isSubmitting={isSubmitting}
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
            <ErrorMessage
              errors={errors}
              name="app_owner_id"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <FieldGroup>
            <label>Start at (required)</label>
            <StyledDateInput
              type="datetime-local"
              {...register('start_at', { valueAsDate: true })}
              disabled={isSubmitting || ended}
            />
            <ErrorMessage
              errors={errors}
              name="start_at"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <FieldGroup>
            <label>End at (required)</label>
            <StyledDateInput
              type="datetime-local"
              {...register('end_at', { valueAsDate: true })}
              disabled={isSubmitting || ended}
            />
            <ErrorMessage
              errors={errors}
              name="end_at"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <FieldGroup>
            <label>Host Lead User (required)</label>
            <Controller
              name="host_lead_dxuser"
              control={control}
              render={({ field: { value, onChange, onBlur }}) => (
                <HostLeadUserSelect
                  isDisabled={isEditMode || isSubmitting}
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
            <ErrorMessage
              errors={errors}
              name="host_lead_dxuser"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <FieldGroup>
            <label>Guest Lead User (required)</label>
            <Controller
              name="guest_lead_dxuser"
              control={control}
              render={({ field: { value, onChange, onBlur }}) => (
                <GuestLeadUserSelect
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  isDisabled={isEditMode || isSubmitting}
                />
              )}
            />
            <ErrorMessage
              errors={errors}
              name="guest_lead_dxuser"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <FieldGroup>
            <label>Status (required)</label>
            <Controller
              name="status"
              control={control}
              render={({ field: { value, onChange, onBlur }}) => (
                <StatusSelect
                  isEditing={isEditMode}
                  isSubmitting={isSubmitting}
                  onChange={(e) => {
                    onChange(e)
                    trigger()
                  }}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
            <ErrorMessage
              errors={errors}
              name="status"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <FieldGroup>
            <label>Preregistration Link</label>
            <InputText
              placeholder="URL for challenge pre-registration"
              {...register('pre_registration_url')}
              disabled={isSubmitting}
            />
            <ErrorMessage
              errors={errors}
              name="pre_registration_url"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>
          <Row>
            <Button
              data-variant='primary'
              disabled={Object.keys(errors).length > 0 || isSubmitting || isSaving}
              type="submit"
            >
              Submit
            </Button>
            {isSubmitting && <Loader />}
          </Row>
        </StyledForm>
      </div>
      <ChallengeCreateUpdateModal isEditMode={isEditMode} isSaving={isSaving} />
    </>
  )
}
