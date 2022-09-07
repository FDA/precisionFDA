import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { UseMutationResult } from 'react-query'
import { ButtonSolidBlue } from '../../../components/Button'
import { Divider, InputError } from '../../../components/form/styles'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { useAuthUser } from '../../auth/useAuthUser'
import { CreateSpacePayload, CreateSpaceResponse } from '../spaces.api'
import { ISpace } from '../spaces.types'
import { RadioButtonGroup } from '../../../components/form/RadioButtonGroup'
import { HintText, Row, StyledForm } from './styles'
import { getSpaceTypeOptions, SPACE_TYPE_HINT, validationSchema } from './helpers'

interface SpaceCreateForm {
  space_type: ISpace['type']
  name: string
  description: string
  source_space_id: string | null
  guest_lead_dxuser: string | null
  host_lead_dxuser: string | null
  sponsor_lead_dxuser: string | null
  review_lead_dxuser: string | null
  cts: string | null
}


export interface ISpaceForm {
  mutation: UseMutationResult<CreateSpaceResponse, unknown, CreateSpacePayload, unknown>
  defaultValues?: Partial<SpaceCreateForm>
}

export const SpaceForm = ({
  mutation,
  defaultValues,
}: ISpaceForm) => {
  const user = useAuthUser()

  const isGovUser = user?.isGovUser || false
  const isAdmin = user?.isAdmin || false
  const isReviewAdmin = user?.review_space_admin || false

  const {
    control,
    clearErrors,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<SpaceCreateForm>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      space_type: 'private_type',
      name: '',
      description: '',
      host_lead_dxuser: '',
      review_lead_dxuser: '',
      sponsor_lead_dxuser: '',
      cts: null,
      ...defaultValues,
    },
  })

  useEffect(() => {
    const stype = watch().space_type
    if (stype === 'private_type' || stype === 'government' || stype === 'administrator') {
      setValue('host_lead_dxuser', null)
      setValue('sponsor_lead_dxuser', null)
      setValue('cts', null)
      clearErrors(['host_lead_dxuser', 'sponsor_lead_dxuser', 'guest_lead_dxuser', 'cts'])
    }
  }, [watch().space_type])

  const onSubmit = () => {
    const vals = getValues()
    if (vals.space_type === 'private_type') {
      vals.host_lead_dxuser = user ? user.dxuser : null
      vals.sponsor_lead_dxuser = ''
      vals.guest_lead_dxuser = ''
    }

    // TODO: weird naming in the form label but the backend expects host_lead to be the review_lead
    if (vals.space_type === 'review') {
      vals.host_lead_dxuser = vals.review_lead_dxuser
      vals.review_lead_dxuser = ''
      vals.guest_lead_dxuser = ''
    }
    // TODO: weird naming in the form label but the backend expects host_lead to be the review_lead
    if (vals.space_type === 'administrator') {
      vals.host_lead_dxuser = user ? user.dxuser : null
      vals.guest_lead_dxuser = ''
      vals.sponsor_lead_dxuser = ''
    }
    if (vals.space_type === 'government') {
      vals.host_lead_dxuser = user ? user.dxuser : null
    }
    mutation.mutateAsync(vals)
  }

  const isSubmitting = mutation.isLoading

  const options = getSpaceTypeOptions({ isAdmin, isGovUser, isReviewAdmin })

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup label="Space type">
        <Controller
          name="space_type"
          control={control}
          render={({ field: { value, onChange, onBlur }}) => (
            <RadioButtonGroup
              onChange={onChange}
              value={value}
              onBlur={onBlur}
              options={options}
              ariaLabel="Spaces option select"
            />
          )}
        />
        <ErrorMessage
          errors={errors}
          name="space_type"
          render={({ message }) => <InputError>{message}</InputError>}
        />
        <HintText>{SPACE_TYPE_HINT[watch().space_type]}</HintText>
      </FieldGroup>

      <Divider />

      <FieldGroup label="Name" required>
        <InputText
          label="Space Name"
          {...register('name', { required: 'Name is required.' })}
          disabled={isSubmitting}
        />
        <ErrorMessage
          errors={errors}
          name="name"
          render={({ message }) => <InputError>{message}</InputError>}
        />
      </FieldGroup>
      <FieldGroup label="Description" required>
        <InputText
          label="Description"
          {...register('description')}
          disabled={isSubmitting}
        />
        <ErrorMessage
          errors={errors}
          name="description"
          render={({ message }) => <InputError>{message}</InputError>}
        />
      </FieldGroup>

      {watch().space_type === 'groups' && (
        <>
          <FieldGroup label="Host Lead" required>
            <InputText
              label="Host Lead"
              {...register('host_lead_dxuser')}
              disabled={isSubmitting}
            />
            <ErrorMessage
              errors={errors}
              name="host_lead_dxuser"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>
          <FieldGroup label="Guest Lead" required>
            <InputText
              label="Guest Lead"
              {...register('guest_lead_dxuser')}
              disabled={isSubmitting}
            />
            <ErrorMessage
              errors={errors}
              name="guest_lead_dxuser"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>
        </>
      )}

      {watch().space_type === 'review' && (
        <>
          <FieldGroup label="Reviewer Lead" required>
            <InputText
              label="Reviewer Lead"
              {...register('review_lead_dxuser')}
              disabled={isSubmitting}
            />
            <ErrorMessage
              errors={errors}
              name="review_lead_dxuser"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <FieldGroup label="Sponsor Lead" required>
            <InputText
              label="Sponsor Lead"
              {...register('sponsor_lead_dxuser')}
              disabled={isSubmitting}
            />
            <ErrorMessage
              errors={errors}
              name="sponsor_lead_dxuser"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <FieldGroup label="Center Tracking System #">
            <InputText
              label="CTS"
              {...register('cts')}
              disabled={isSubmitting}
            />
            <HintText>
              FDA uses the Center Tracking System (CTS) to track the progress of
              industry submitted pre-market documents through the review
              process. CTS is a workflow/work management system that provides
              support for the Center for Devices and Radiogical Health (CDRH)
              business processes and business rules, for all stages of the
              product lifecycle for medical devices.
            </HintText>
            <ErrorMessage
              errors={errors}
              name="cts"
              render={({ message }) => <InputError>{message}</InputError>}
            />
            <Divider />
          </FieldGroup>
        </>
      )}

      <Row>
        <ButtonSolidBlue
          disabled={Object.keys(errors).length > 0 || isSubmitting}
          type="submit"
        >
          Save
        </ButtonSolidBlue>
        {isSubmitting && <Loader />}
      </Row>
    </StyledForm>
  )
}
