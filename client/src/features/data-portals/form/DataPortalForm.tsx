/* eslint-disable jsx-a11y/label-has-associated-control */
import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Prompt } from 'react-router'
import styled from 'styled-components'
import { ButtonSolidBlue } from '../../../components/Button'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { IndeterminateCheckbox } from '../../../components/Table/IndeterminateCheckbox'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { CheckboxLabel, CheckboxTip, InputError } from '../../../components/form/styles'
import { SavingModal } from './SavingModal'
import { StatusSelect } from './StatusSelect'
import { UsersSelect } from './UsersSelect'
import { createValidationSchema, editValidationSchema } from './common'

type SelectItem = { label: string; value: string }

export interface CreateDataPortalForm {
  name: string
  description: string
  default: boolean
  host_lead_dxuser: SelectItem | null
  guest_lead_dxuser: SelectItem | null
  status: SelectItem | null
  sort_order: number
  card_image_uid: string | null
  card_image_url: string
  card_image_file: File[] | null
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
  defaultValues,
  onSubmit,
  onImageSelection,
  isSaving = false,
  isEditMode = false,
  canEditMainDataPortal = false,
  mutationErrors,
}: {
  defaultValues?: CreateDataPortalForm
  onSubmit: (a: any) => Promise<any>
  onImageSelection?: (img: File) => Promise<any>
  isSaving?: boolean
  isEditMode?: boolean
  canEditMainDataPortal?: boolean
  mutationErrors?: { response: { data: { error: any }} }
}) => {
  const [base64Image, setBase64Image] = React.useState<string | null>(null)

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
      default: false,
      host_lead_dxuser: null,
      guest_lead_dxuser: null,
      sort_order: 0,
      card_image_file: null,
      card_image_uid: null,
      status: { label: 'open', value: 'open' },
    },
  })

  useEffect(() => {
    const img = watch().card_image_file
    if (img?.[0] != null) {
      getBase64(img?.[0], setBase64Image)
    }
  }, [watch().card_image_file])

  useEffect(() => {
    if (mutationErrors?.response?.data?.error) {
      setError('root.serverError', {
        type: mutationErrors.response.data.error.statusCode,
        message: mutationErrors.response.data.error.message,
      })
    }
  }, [mutationErrors])

  const submitErrors = { ...errors }
  delete submitErrors['root']

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
          <FieldGroup label="Portal image" required>
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
                  alt="portal img"
                />
              )
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
          <FieldGroup label="First Lead User" required>
            <Controller
              name="host_lead_dxuser"
              control={control}
              render={({ field: { value, onChange, onBlur }}) => (
                <UsersSelect
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
          <FieldGroup label="Second Lead User" required>
            <Controller
              name="guest_lead_dxuser"
              control={control}
              render={({ field: { value, onChange, onBlur }}) => (
                <UsersSelect
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
          <FieldGroup label="Status" required>
            <Controller
              name="status"
              control={control}
              render={({ field: { value, onChange, onBlur }}) => (
                <StatusSelect
                  isDisabled={isSubmitting}
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
          {canEditMainDataPortal && (
            <Row>
              <FieldGroup label="Sort order">
                <InputText
                  type="number"
                  step="1"
                  min="0"
                  label="Sort Order"
                  placeholder="What is the portal's sort order?"
                  {...register('sort_order')}
                  disabled={isSubmitting || watch().default === true}
                />
                <ErrorMessage
                  errors={errors}
                  name="sort_order"
                  render={({ message }) => <InputError>{message}</InputError>}
                />
              </FieldGroup>
              <FieldGroup>
                <CheckboxLabel>
                  <Controller
                    data-tip
                    data-for="default"
                    name="default"
                    control={control}
                    render={({ field }) => {
                      return (
                        <IndeterminateCheckbox
                          checked={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      )
                    }}
                  />
                  Default
                </CheckboxLabel>
                <CheckboxTip>
                  Enabling will make this Data Portal the default for users
                </CheckboxTip>
              </FieldGroup>
            </Row>
          )}
          <Row>
            <ErrorMessage
              errors={errors}
              name="root.serverError"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </Row>
          <Row>
            <ButtonSolidBlue disabled={Object.keys(submitErrors).length > 0 || isSubmitting || isSaving} type="submit">
              Submit
            </ButtonSolidBlue>
            {isSubmitting && <Loader />}
          </Row>
        </StyledForm>
      </div>
      <SavingModal isEditMode={isEditMode} isSaving={isSubmitting} key="data-portal-save" />
    </>
  )
}
