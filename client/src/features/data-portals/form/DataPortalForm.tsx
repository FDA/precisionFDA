/* eslint-disable jsx-a11y/label-has-associated-control */
import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Prompt } from 'react-router'
import styled from 'styled-components'
import { ButtonSolidBlue } from '../../../components/Button'
import { InputError } from '../../../components/form/styles'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { useMutationErrorEffect } from '../../../hooks/useMutationErrorEffect'
import { MutationErrors } from '../../../types/utils'
import { DataPortal } from '../types'
import { createValidationSchema, editValidationSchema } from './common'
import { StatusSelect } from './StatusSelect'
import { HostLeadUserSelect } from '../../challenges/form/HostLeadUserSelect'
import { GuestLeadUserSelect } from '../../challenges/form/GuestLeadUserSelect'


interface CreateDataPortalForm {
  id: number
  name: string
  description: string
  lead: string
  second_lead: string
  sort_order: number
  card_image_file: File[]
  card_image_uid: string
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

export const DataPortalForm = ({
  dataPortal,
  defaultValues,
  onSubmit,
  onImageSelection,
  isSaving = false,
  mutationErrors,
}: {
  dataPortal?: DataPortal
  defaultValues?: CreateDataPortalForm
  onSubmit: (a: any) => Promise<any>
  onImageSelection?: (img: File) => Promise<any>
  isSaving?: boolean
  mutationErrors?: MutationErrors
}) => {
  const [base64Image, setBase64Image] = React.useState<string | null>(null)
  const isEditMode = !!dataPortal

  const {
    control,
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<CreateDataPortalForm>({
    mode: 'onBlur',
    resolver: yupResolver(
      isEditMode ? editValidationSchema : createValidationSchema,
    ),
    defaultValues: defaultValues || {
      name: '',
      description: '',
      lead: null,
      second_lead: null,
      sort_order: 0,
      card_image_file: null,
      card_image_uid: null,
    },
  })

  useEffect(() => {
    const img = watch().card_image_file
    if (img?.[0] != null) {
      if (onImageSelection) onImageSelection(img[0])
      getBase64(img?.[0], setBase64Image)
    }
  }, [watch().card_image_file])

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
          <FieldGroup label="Name" required>
            <InputText
              label="Name"
              placeholder="Name of the portal"
              {...register('name')}
              disabled={isSubmitting}
            />
            <ErrorMessage
              errors={errors}
              name="name"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>
          <FieldGroup label="Description">
            <InputText
              type="textarea"
              label="Description"
              placeholder="What is this portal about?"
              {...register('description')}
              disabled={isSubmitting}
            />
            <ErrorMessage
              errors={errors}
              name="description"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>
          <FieldGroup label="Portal image:" required>
            {base64Image || dataPortal?.card_image_file ? (
              <ImageUploadPreview
                width={300}
                src={base64Image || dataPortal?.card_image_file || undefined}
                alt="portal img"
              />
            ) : defaultValues?.card_image_url && (
              <ImageUploadPreview
                width={300}
                src={defaultValues?.card_image_url}
                alt="portal img"
              />
            )}

            <>
              <InputText
                label="cardImage"
                type="file"
                accept="image/*"
                {...register('card_image_file')}
                disabled={isSubmitting}
              />
              <ErrorMessage
                errors={errors}
                name="card_image_file"
                render={({ message }) => <InputError>{message}</InputError>}
              />
            </>

            {/* disabled changing image for edit mode */}
          </FieldGroup>
          <FieldGroup label="Data Portal Team Lead User" required>
            <Controller
              name="host_lead_dxuser"
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
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
          <FieldGroup label="Second Team Lead User" required>
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
          <FieldGroup label="Sort order">
            <InputText
              type="textarea"
              label="Description"
              placeholder="What is the portal's sort order?"
              {...register('sort_order')}
              disabled={isSubmitting}
            />
            <ErrorMessage
              errors={errors}
              name="sort_order"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>
          <FieldGroup label="Status" required>
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
          <Row>
            <ButtonSolidBlue
              disabled={
                Object.keys(errors).length > 0 || isSubmitting || isSaving
              }
              type="submit"
            >
              Submit
            </ButtonSolidBlue>
            {isSubmitting && <Loader />}
          </Row>
        </StyledForm>
      </div>
    </>
  )
}
