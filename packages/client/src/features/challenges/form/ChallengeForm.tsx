/* eslint-disable jsx-a11y/label-has-associated-control */
import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import styled from 'styled-components'
import { unstable_usePrompt } from 'react-router'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { FieldLabel, InputError } from '../../../components/form/styles'
import { InputDateTime, InputFile, InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
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
  appOwnerId: { label: string; value: number }
  startAt: Date
  endAt: Date
  hostLeadDxuser: { label: string; value: string }
  guestLeadDxuser: { label: string; value: string }
  cardImageUrl: string
  cardImageId: string
  cardImageFile: File[]
  status: { label: string; value: string }
  preRegistrationUrl: string
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
}: {
  challenge?: Challenge
  defaultValues?: Partial<IChallengeForm>
  onSubmit: (a: IChallengeForm) => Promise<unknown>
  isSaving?: boolean
}) => {
  const [base64Image, setBase64Image] = React.useState<string | null>(null)
  const isEditMode = !!challenge
  const ended = isEditMode
    ? new Date().getTime() > new Date(challenge.endAt).getTime()
    : false

  const {
    control,
    register,
    handleSubmit,
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
      scope: undefined,
      appOwnerId: undefined,
      startAt: undefined,
      endAt: undefined,
      hostLeadDxuser: undefined,
      guestLeadDxuser: undefined,
      cardImageFile: undefined,
      cardImageUrl: undefined,
      cardImageId: undefined,
      status: undefined,
      preRegistrationUrl: '',
      ...defaultValues,
    },
  })

  useEffect(() => {
    const img = watch().cardImageFile
    if (img?.[0] != null) {
      getBase64(img?.[0], setBase64Image)
    }
  }, [watch().cardImageFile])


  unstable_usePrompt({
    message: 'There are unsaved changes, are you sure you want to leave?',
    when: ({ currentLocation, nextLocation }) =>
      (!isSubmitting && Object.keys(dirtyFields).length > 0) &&
      currentLocation.pathname !== nextLocation.pathname,
  })

  return (
    <>
      <div>
        <StyledForm onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <FieldGroup label='Name' required>
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

          <FieldGroup label='Description'>
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
                alt="challenge img"
              />
            ) : (
              defaultValues?.cardImageUrl && (
                <ImageUploadPreview
                  width={300}
                  src={defaultValues?.cardImageUrl}
                  alt="challenge img"
                />
              )
            )}

            <>
              <FieldLabel>
                Challenge image file
              </FieldLabel>
              <InputFile
                {...register('cardImageFile')}
                type="file"
                accept="image/*"
                disabled={isSubmitting}
              />
              <ErrorMessage
                errors={errors}
                name="cardImageFile"
                render={({ message }) => <InputError>{message}</InputError>}
              />
            </>
          </FieldGroup>

          <FieldGroup label='Scope' required>
            <Controller
              name="scope"
              control={control}
              render={({ field: { onChange, onBlur, value }}) => (
                <ScopeFieldSelect
                  isSubmitting={isSubmitting || isEditMode}
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

          <FieldGroup label='Scoring App User' required>
            <Controller
              name="appOwnerId"
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

          <FieldGroup label='Start at' required>
            <StyledDateInput
              type="datetime-local"
              {...register('startAt', { valueAsDate: true })}
              disabled={isSubmitting || ended}
            />
            <ErrorMessage
              errors={errors}
              name="startAt"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <FieldGroup label='End at' required>
            <StyledDateInput
              type="datetime-local"
              {...register('endAt', { valueAsDate: true })}
              disabled={isSubmitting || ended}
            />
            <ErrorMessage
              errors={errors}
              name="endAt"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <FieldGroup label='Host Lead User' required>
            <Controller
              name="hostLeadDxuser"
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
              name="hostLeadDxuser"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <FieldGroup label='Guest Lead User' required>
            <Controller
              name="guestLeadDxuser"
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
              name="guestLeadDxuser"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <FieldGroup label='Status' required >
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

          <FieldGroup label='Preregistration Link'>
            <InputText
              placeholder="URL for challenge pre-registration"
              {...register('preRegistrationUrl')}
              disabled={isSubmitting}
            />
            <ErrorMessage
              errors={errors}
              name="preRegistrationUrl"
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
