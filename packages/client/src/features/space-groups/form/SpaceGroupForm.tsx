import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { InputError } from '../../../components/form/styles'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { Row, StyledForm } from '../../spaces/form/styles'
import { Button } from '../../../components/Button'
import { spaceGroupValidationSchema } from './helpers'

export interface SpaceGroupCreateFormData {
  name: string
  description: string
}

export interface ISpaceGroupForm {
  defaultValues?: Partial<SpaceGroupCreateFormData>
  onSubmit: (a: any) => Promise<void>
  isSaving?: boolean
  isSubmitting: boolean
  mutationErrors?: { response: { data: { error: any } } }
}

export const SpaceGroupForm = ({ defaultValues, onSubmit, isSaving = false, isSubmitting, mutationErrors }: ISpaceGroupForm) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SpaceGroupCreateFormData>({
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
    <StyledForm onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup label="Name" required>
        <InputText {...register('name', { required: 'Name is required.' })} disabled={isSubmitting} />
        <ErrorMessage errors={errors} name="name" render={({ message }) => <InputError>{message}</InputError>} />
      </FieldGroup>
      <FieldGroup label="Description" required>
        <InputText {...register('description')} disabled={isSubmitting} />
        <ErrorMessage errors={errors} name="description" render={({ message }) => <InputError>{message}</InputError>} />
      </FieldGroup>

      <Row>
        <Button data-variant="primary" disabled={Object.keys(submitErrors).length > 0 || isSubmitting || isSaving} type="submit">
          Create Space Group
        </Button>
        {isSubmitting && <Loader />}
      </Row>
    </StyledForm>
  )
}
