import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { AxiosError } from 'axios'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { unstable_usePrompt } from 'react-router'
import { Tooltip } from 'react-tooltip'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { InputFile, InputNumber, InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { FieldInfo } from '../../../components/form/FieldInfo'
import { InputError } from '../../../components/form/styles'
import { useAuthUser } from '../../auth/useAuthUser'
import { ApiErrorResponse } from '../../home/types'
import { SavingModal } from '../../modal/SavingModal'
import { UsersSelect } from './UsersSelect'
import { dataPortalValidationSchema } from './common'

type SelectItem = { label: string; value: string }

export interface CreateDataPortalForm {
  name: string
  description: string
  urlSlug: string
  hostLeadDxuser: SelectItem
  guestLeadDxuser: SelectItem
  sortOrder: number
  cardImageUid: string | null
  cardImageUrl: string | null
  cardImageFile: FileList | null
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
    reader.addEventListener('load', () => callback && callback(reader.result as string))
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
  onSubmit: (a: CreateDataPortalForm) => Promise<unknown>
  isSaving?: boolean
  isEditMode?: boolean
  canEditMainDataPortal?: boolean
  isSubmitting: boolean
  mutationErrors?: AxiosError<ApiErrorResponse> | null
}) => {
  const user = useAuthUser()
  const [base64Image, setBase64Image] = React.useState<string | null>(null)

  const [slugEdited, setSlugEdited] = React.useState<boolean>(false)
  const [canUploadImage, setCanUploadImage] = React.useState<boolean>(true)

  const {
    control,
    register,
    handleSubmit,
    setError,
    watch,
    getValues,
    setValue,
    resetField,
    formState: { errors, dirtyFields },
  } = useForm<CreateDataPortalForm>({
    resolver: yupResolver(dataPortalValidationSchema),
    defaultValues: defaultValues || {
      name: '',
      description: '',
      urlSlug: '',
      hostLeadDxuser: {
        label: '',
        value: '',
      },
      guestLeadDxuser: {
        label: '',
        value: '',
      },
      sortOrder: 0,
      cardImageFile: null,
      cardImageUid: null,
      cardImageUrl: null,
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
    const img = watch().cardImageFile
    if (img?.[0] != null) {
      getBase64(img?.[0], setBase64Image)
    }
  }, [watch().cardImageFile])

  useEffect(() => {
    // Do not automatically update the slug field in case the user changed the value manually or in edit mode
    if (!slugEdited && !isEditMode) {
      setValue('urlSlug', slugify(getValues('name')))
      delete errors.urlSlug
    }
  }, [watch().name])

  useEffect(() => {
    setValue('urlSlug', slugify(getValues('urlSlug')))
  }, [watch().urlSlug])

  useEffect(() => {
    const hostLead = watch().hostLeadDxuser?.value
    const guestLead = watch().guestLeadDxuser?.value
    const noLeadsSelected = !hostLead || !guestLead
    const currentUserIsLead = [hostLead, guestLead].includes(user?.dxuser ?? '')
    const canUpload = noLeadsSelected || currentUserIsLead || isEditMode
    setCanUploadImage(canUpload)
    if (!canUpload) {
      resetField('cardImageFile')
      setBase64Image(null)
    }
  }, [watch().hostLeadDxuser, watch().guestLeadDxuser])

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
    when: ({ currentLocation, nextLocation }) =>
      !isSubmitting && Object.keys(dirtyFields).length > 0 && currentLocation.pathname !== nextLocation.pathname,
  })

  const submitErrors = { ...errors }
  delete submitErrors['root']

  return (
    <>
      <StyledForm onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <FieldGroup label="Name" required>
          <InputText placeholder="Name of the portal" {...register('name')} disabled={isSubmitting} />
          <ErrorMessage errors={errors} name="name" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
        <FieldGroup label="URL slug" required>
          <InputText
            placeholder="URL slug"
            {...register('urlSlug')}
            disabled={isSubmitting || isEditMode}
            onChange={e => {
              setSlugEdited(true) // The URL slug field was manually edited
              register('urlSlug').onChange(e) // Trigger default onChange event
            }}
          />
          <FieldInfo text="Once Data portal is created, the URL slug cannot be edited" />
          <ErrorMessage errors={errors} name="urlSlug" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
        <FieldGroup label="Description">
          <InputText
            type="textarea"
            placeholder="What is this portal about?"
            {...register('description')}
            disabled={isSubmitting}
          />
          <ErrorMessage errors={errors} name="description" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
        <FieldGroup label="First Lead User" required>
          <Controller
            name="hostLeadDxuser"
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
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
            name="hostLeadDxuser.value"
            render={({ message }) => <InputError>{message}</InputError>}
          />
        </FieldGroup>
        <FieldGroup label="Second Lead User" required>
          <Controller
            name="guestLeadDxuser"
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
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
            name="guestLeadDxuser.value"
            render={({ message }) => <InputError>{message}</InputError>}
          />
        </FieldGroup>
        <FieldGroup label="Portal image">
          {base64Image ? (
            <ImageUploadPreview width={300} src={base64Image || undefined} alt="portal img" />
          ) : (
            defaultValues?.cardImageUrl && <ImageUploadPreview width={300} src={defaultValues?.cardImageUrl} alt="portal img" />
          )}

          <>
            <InputFile
              type="file"
              accept="image/*"
              {...register('cardImageFile')}
              disabled={!canUploadImage || isSubmitting}
              data-tooltip-id={'card_image_file_disabled'}
              data-tooltip-content={
                'Image upload is only available to portal leads. You must be selected as First Lead or Second Lead to upload.'
              }
            />
            <ErrorMessage errors={errors} name="cardImageFile" render={({ message }) => <InputError>{message}</InputError>} />
            {!canUploadImage && <Tooltip id="card_image_file_disabled" />}
          </>

          {/* disabled changing image for edit mode */}
        </FieldGroup>
        {canEditMainDataPortal && (
          <Row>
            <FieldGroup label="Sort order">
              <InputNumber
                step="1"
                min="0"
                placeholder="What is the portal's sort order?"
                {...register('sortOrder')}
                disabled={isSubmitting}
              />
              <FieldInfo text="Portals are presented in ascending order" />
              <ErrorMessage errors={errors} name="sortOrder" render={({ message }) => <InputError>{message}</InputError>} />
            </FieldGroup>
          </Row>
        )}
        <Row>
          <ErrorMessage errors={errors} name="root.serverError" render={({ message }) => <InputError>{message}</InputError>} />
        </Row>
        <Row>
          <Button
            data-variant="primary"
            disabled={Object.keys(submitErrors).length > 0 || isSubmitting || isSaving}
            type="submit"
          >
            Submit
          </Button>
          {isSubmitting && <Loader />}
        </Row>
      </StyledForm>

      <SavingModal
        modalId="data-portal-save"
        headerText={isEditMode ? 'Updating Data Portal' : 'Creating new Data Portal'}
        body={`The Data Portal is being ${isEditMode ? 'updated' : 'created'}, please wait until this message disappears.`}
        isSaving={isSubmitting}
      />
    </>
  )
}
