/* eslint-disable jsx-a11y/label-has-associated-control */
import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Prompt } from 'react-router'
import styled from 'styled-components'

import { ButtonSolidBlue } from '../../../components/Button'
import { FieldGroup, InputError } from '../../../components/form/styles'
import { InputText } from '../../../components/InputText'
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

const StyledDateInput = styled(InputText)`
  width: fit-content;
`

interface CreateChallengeForm {
  name: string
  description: string
  scope: { label: string; value: string } | null
  app_owner_id: { label: string; value: string } | null
  start_at: Date | null
  end_at: Date | null
  host_lead_dxuser: { label: string; value: string } | null
  guest_lead_dxuser: { label: string; value: string } | null
  cardImage: null | FileList
  card_image_url: string | null
  card_image_id: string | null
  status: { label: string; value: string } | null
  pre_registration_url: string | null
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

export const ChallengeForm = ({
  challenge,
  defaultValues = {},
  onSubmit,
  onImageSelection,
  isSaving = false,
  mutationErrors,
}: {
  challenge?: Challenge
  defaultValues?: any
  onSubmit: (a: any) => Promise<any>
  onImageSelection?: (img: File) => Promise<any>
  isSaving?: boolean
  mutationErrors?: MutationErrors
}) => {
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
  } = useForm<CreateChallengeForm>({
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
      cardImage: null,
      card_image_url: null,
      card_image_id: null,
      status: null,
      pre_registration_url: '',
      ...defaultValues,
    },
  })

  const img = watch().cardImage

  useEffect(() => {
    if (img?.[0] != null) {
      if(onImageSelection) onImageSelection(img[0])
    }
  }, [watch().cardImage])

  useMutationErrorEffect(setError, mutationErrors)

  return (
    <>
      <Prompt
        when={
          !isSubmitting && isEditMode && Object.keys(dirtyFields).length > 0
        }
        message="There are unsaved changes, are you sure you want to leave?"
      />
      <div>
        <StyledForm onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <FieldGroup>
            <label>Name (required):</label>
            <InputText
              label="Name"
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
            <label>Description:</label>
            <InputText
              type="textarea"
              label="Description"
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
            <label>Challenge image (required):</label>
            {isEditMode ? (
              <img
                width={300}
                src={challenge.card_image_url || undefined}
                alt="challenge card"
              />
            ) : (
              <>
                <InputText
                  label="cardImage"
                  type="file"
                  accept="image/*"
                  {...register('cardImage')}
                  disabled={isSubmitting || isEditMode}
                />
                <ErrorMessage
                  errors={errors}
                  name="cardImage"
                  render={({ message }) => <InputError>{message}</InputError>}
                />
              </>
            )}
            {/* disabled changing image for edit mode */}
          </FieldGroup>

          <FieldGroup>
            <label>Scope (required):</label>
            <Controller
              name="scope"
              control={control}
              render={({ field: { onChange, onBlur, value }}) => (
                <ScopeFieldSelect
                  challengeId={challenge?.id.toString() || undefined}
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
            <label>Scoring App User (required):</label>
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
            <label>Start at (required):</label>
            <StyledDateInput
              type="datetime-local"
              label="Start at"
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
            <label>End at (required):</label>
            <StyledDateInput
              type="datetime-local"
              label="End at"
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
            <label>Host Lead User (required):</label>
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
            <label>Guest Lead User (required):</label>
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
            <label>Status (required):</label>
            <Controller
              name="status"
              control={control}
              render={({ field: { value, onChange, onBlur }}) => (
                <StatusSelect
                  isEditing={isEditMode}
                  isSubmitting={isSubmitting}
                  onChange={onChange}
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
            <label>Preregistration Link:</label>
            <InputText
              label="pre_registration_url"
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
            <ButtonSolidBlue
              disabled={Object.keys(errors).length > 0 || isSubmitting}
              type="submit"
            >
              Submit
            </ButtonSolidBlue>
            {isSubmitting && <Loader />}
          </Row>
        </StyledForm>
      </div>
      <ChallengeCreateUpdateModal isEditMode={isEditMode} isSaving={isSaving} />
    </>
  )
}
