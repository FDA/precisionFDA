/* eslint-disable jsx-a11y/label-has-associated-control */
import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { unstable_usePrompt } from 'react-router-dom'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { InputFile, InputNumber, InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { FieldInfo } from '../../../components/form/FieldInfo'
import { InputError } from '../../../components/form/styles'
import { SavingModal } from './SavingModal'
import { StatusSelect } from './StatusSelect'
import { UsersSelect } from './UsersSelect'
import { createValidationSchema, editValidationSchema } from './common'

type SelectItem = { label: string; value: string }

export interface CreateDataPortalForm {
  name: string
  description: string
  url_slug: string
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
  isSaving = false,
  isEditMode = false,
  canEditMainDataPortal = false,
  isSubmitting,
  mutationErrors,
}: {
  defaultValues?: CreateDataPortalForm
  onSubmit: (a: any) => Promise<any>
  isSaving?: boolean
  isEditMode?: boolean
  canEditMainDataPortal?: boolean
  isSubmitting: boolean,
  mutationErrors?: { response: { data: { error: any }} }
}) => {
  const [base64Image, setBase64Image] = React.useState<string | null>(null)

  const [slugEdited, setSlugEdited] = React.useState<boolean>(false)

  const {
    control,
    register,
    handleSubmit,
    setError,
    watch,
    getValues,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<CreateDataPortalForm>({
    resolver: yupResolver(
      isEditMode ? editValidationSchema : createValidationSchema,
    ),
    defaultValues: defaultValues || {
      name: '',
      description: '',
      url_slug: '',
      host_lead_dxuser: null,
      guest_lead_dxuser: null,
      sort_order: 0,
      card_image_file: null,
      card_image_uid: null,
      status: { label: 'open', value: 'open' },
    },
  })

  const URL_SLUG_MAX_LENGTH = 50

  const slugify = (input: string) => {
    let slug = input.toLowerCase()
    // Leave alphanumeric characters and whitespaces only
    slug = slug.replace(/[^a-z0-9\- ]/g, '')
    // Replace whitespaces with dashes
    slug = slug.replace(/\s+/g, '-')
    // Replace clusters of dashes with just one dash; limit the max length
    return slug.replace(/-+/g, '-').substring(0, URL_SLUG_MAX_LENGTH)
  }

  useEffect(() => {
    const img = watch().card_image_file
    if (img?.[0] != null) {
      getBase64(img?.[0], setBase64Image)
    }
  }, [watch().card_image_file])

  useEffect(() => {
    // Do not automatically update the slug field in case the user changed the value manually or in edit mode
    if (!slugEdited && !isEditMode) {
      setValue('url_slug', slugify(getValues('name')))
      delete errors.url_slug
    }
  }, [watch().name])

  useEffect(() => {
    setValue('url_slug', slugify(getValues('url_slug')))
  }, [watch().url_slug])

  useEffect(() => {
    if (mutationErrors?.response?.data?.error) {
      setError('root.serverError', {
        type: mutationErrors.response.data.error.statusCode,
        message: mutationErrors.response.data.error.message,
      })
    }
  }, [mutationErrors])

  unstable_usePrompt({
    message: 'There are unsaved changes, are you sure you want to leave?',
    when: ({ currentLocation, nextLocation }: any) =>
      (!isSubmitting && Object.keys(dirtyFields).length > 0) &&
      currentLocation.pathname !== nextLocation.pathname,
  })

  const submitErrors = { ...errors }
  delete submitErrors['root']

  return (
    <>
        <StyledForm onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <FieldGroup label="Name" required>
            <InputText
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
          <FieldGroup label="URL slug" required>
            <InputText
                placeholder="URL slug"
                {...register('url_slug')}
                disabled={isSubmitting || isEditMode}
                onBlur={() => setSlugEdited(true)}
            />
            <FieldInfo text="Once Data portal is created, the URL slug cannot be edited" />
            <ErrorMessage
                errors={errors}
                name="url_slug"
                render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>
          <FieldGroup label="Description">
            <InputText
                type="textarea"
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
              <InputFile
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
                  inputId="data-portal_host-lead"
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
                  inputId="data-portal_guest-lead"
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
                <InputNumber
                  step="1"
                  min="0"
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
            <Button data-variant="primary" disabled={Object.keys(submitErrors).length > 0 || isSubmitting || isSaving} type="submit">
              Submit
            </Button>
            {isSubmitting && <Loader />}
          </Row>
        </StyledForm>

      <SavingModal isEditMode={isEditMode} isSaving={isSubmitting} key="data-portal-save" />
    </>
  )
}
