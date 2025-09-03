import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { AxiosError } from 'axios'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/Button'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { InputError } from '../../../components/form/styles'
import { InputText, InputTextArea } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { ApiErrorResponse } from '../../home/types'
import { Footer, StyledForm, StyledModalScroll } from '../../modal/styles'
import { SpaceGroupFormData } from '../types'
import { spaceGroupValidationSchema } from './helpers'

export interface ISpaceGroupForm {
  defaultValues?: Partial<SpaceGroupFormData>
  onSubmit: (data: SpaceGroupFormData) => Promise<void>
  isSaving?: boolean
  isSubmitting: boolean
  mutationErrors?: AxiosError<ApiErrorResponse>
  action: 'create' | 'edit'
  setShowModal: (val: boolean) => void
}

export const SpaceGroupForm = ({
  defaultValues,
  onSubmit,
  isSaving = false,
  isSubmitting,
  mutationErrors,
  action,
}: ISpaceGroupForm) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SpaceGroupFormData>({
    mode: 'onBlur',
    resolver: yupResolver(spaceGroupValidationSchema),
    defaultValues: defaultValues || {
      name: '',
      description: '',
    },
  })

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
      <StyledModalScroll>
        <StyledForm id={`${action}-space-group-form`} onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup label="Name" required>
            <InputText {...register('name', { required: 'Name is required.' })} disabled={isSubmitting} />
            <ErrorMessage errors={errors} name="name" render={({ message }) => <InputError>{message}</InputError>} />
          </FieldGroup>
          <FieldGroup label="Description" required>
            <InputTextArea {...register('description')} disabled={isSubmitting} />
            <ErrorMessage errors={errors} name="description" render={({ message }) => <InputError>{message}</InputError>} />
          </FieldGroup>
        </StyledForm>
      </StyledModalScroll>
      <Footer>
        <Button
          data-variant="primary"
          form={`${action}-space-group-form`}
          disabled={Object.keys(submitErrors).length > 0 || isSubmitting || isSaving}
          type="submit"
        >
          {action === 'create' ? 'Create' : 'Edit'} Space Group
        </Button>
        {isSubmitting && <Loader />}
      </Footer>
    </>
  )
}
