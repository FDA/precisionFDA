import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { UseMutationResult } from 'react-query'
import * as Yup from 'yup'
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
import { getSpaceTypeOptions } from './helpers'

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

const SPACE_TYPE_HINT: Record<ISpace['type'], string> = {
  private_type: 'Available to all users, and only consists of a private area.',
  groups:
    'Site admins can create a space in which any users can be invited.\nFor challenges, a group space is automatically created to house all user submissions.\nGroup spaces has two sides (Host and Lead), ',
  review:
    'Each Review Space has 2 areas: private and cooperative ones.\nEach review Space has 2 sides: reviewers and sponsors.',
  government:
    'Only a government user may create or join a Government-Restriced Space.\nValidation and error message should appear in the "Create Space" and "Add Members" forms to check that an entered username belongs to a government user.\nGovernment spaces only has one side, which is the Shared area.',
  administrator:
    'Only site admins can be members of an Administrator Space. Membership is implicit, i.e. all site admins can access and use any Administrator Space\nAdministrator space has only one side, which is the Shared area',
}

const validationSchema = Yup.object().shape({
  space_type: Yup.string().required('Engine required'),
  name: Yup.string().required('Name required'),
  description: Yup.string().required('Description required'),
  guest_lead_dxuser: Yup.string()
    .nullable()
    .when('space_type', {
      is: (space_type: string) => space_type === 'groups',
      then: Yup.string().required('Guest lead required'),
    }),
  review_lead_dxuser: Yup.string()
    .nullable()
    .when('space_type', {
      is: (space_type: string) => space_type === 'review',
      then: Yup.string().required('Review lead required'),
    }),
  host_lead_dxuser: Yup.string()
    .nullable()
    .when('space_type', {
      is: (space_type: string) => space_type === 'groups',
      then: Yup.string().required('Host lead required'),
    }),
  sponsor_lead_dxuser: Yup.string()
    .nullable()
    .when('space_type', {
      is: (space_type: string) => space_type === 'review',
      then: Yup.string().required('Sponsor lead required'),
    }),
  cts: Yup.string()
    .nullable()
    .when('space_type', {
      is: (space_type: string) => space_type === 'review',
      then: Yup.string().nullable(),
    }),
})

export interface ISpaceForm {
  mutation: UseMutationResult<CreateSpaceResponse, unknown, CreateSpacePayload, unknown>
  defaultValues?: Partial<SpaceCreateForm>
}

export const SpaceForm = ({
  mutation,
  defaultValues,
}: ISpaceForm) => {
  const user = useAuthUser()

  const isGovUser = user.isGovUser || false
  const isAdmin = user.isAdmin || false
  const isReviewAdmin = user.review_space_admin || false

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
      vals.host_lead_dxuser = user.dxuser
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
      vals.host_lead_dxuser = user.dxuser
      vals.guest_lead_dxuser = ''
      vals.sponsor_lead_dxuser = ''
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
