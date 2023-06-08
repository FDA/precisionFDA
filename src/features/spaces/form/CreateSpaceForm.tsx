import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { UseMutationResult } from '@tanstack/react-query'
import { ButtonSolidBlue } from '../../../components/Button'
import { Divider, InputError } from '../../../components/form/styles'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { useAuthUser } from '../../auth/useAuthUser'
import { CreateSpacePayload, CreateSpaceResponse } from '../spaces.api'
import { ISpace } from '../spaces.types'
import { RadioButtonGroup } from '../../../components/form/RadioButtonGroup'
import { HintText, Row, CheckboxLabel, StyledForm } from './styles'
import {
  getSpaceTypeOptions,
  SPACE_TYPE_HINT,
  validationSchema,
} from './helpers'
import { Checkbox } from '../../../components/Checkbox'
import { useConfirm } from '../../modal/useConfirm'

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
  protected: boolean | null
}

export interface ISpaceForm {
  mutation: UseMutationResult<
    CreateSpaceResponse,
    unknown,
    CreateSpacePayload,
    unknown
  >
  defaultValues?: Partial<SpaceCreateForm>
  isDuplicate?: boolean
}

export const SpaceForm = ({
  mutation,
  defaultValues,
  isDuplicate = false,
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
      protected: null,
      ...defaultValues,
    },
  })

  useEffect(() => {
    const stype = watch().space_type
    if (
      stype === 'private_type' ||
      stype === 'government' ||
      stype === 'administrator'
    ) {
      setValue('cts', null)
      clearErrors([
        'host_lead_dxuser',
        'sponsor_lead_dxuser',
        'guest_lead_dxuser',
        'cts',
      ])
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

  const handleProtectedSelection = (event: any) => {
    setValue('protected', event.target.checked)
  }

  const isSubmitting = mutation.isLoading

  const options = getSpaceTypeOptions({
    isAdmin,
    isGovUser,
    isReviewAdmin,
    isDuplicate,
  })

  const {
    open: openConfirmation,
    Confirm: ConfirmSubmit,
  } = useConfirm(
    handleSubmit(onSubmit),
    <div><b>The space you are about to create will be protected.</b><p>Are you sure you would like to continue?</p></div>,
  )

  return (
    <StyledForm>
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

      {(watch().space_type === 'review' || watch().space_type === 'groups') && (
        <FieldGroup>
          <CheckboxLabel>
            <Checkbox
              {...register('protected')}
              disabled={isSubmitting}
              onChange={handleProtectedSelection}
            />
            Space Protection
          </CheckboxLabel>
          <HintText>
            When enabled the space will be subject to the following restrictions:
            <ul>
              <li>Data in this space cannot be copied to My Home or Private Spaces, nor downloaded, except by a lead of the space.</li>
              <li>Data in this space can only be copied to Spaces that also have protection enabled, and the copying user must be a lead member of both the source and destination spaces.</li>
              <li>Space protection cannot be disabled for a Space or be turned off by any member, not even the leads.</li>
            </ul>
          </HintText>
        </FieldGroup>
      )}

      <Row>
        <ButtonSolidBlue
          disabled={Object.keys(errors).length > 0 || isSubmitting}
          type="button"
          onClick={getValues().protected ? openConfirmation: handleSubmit(onSubmit)}
        >
          Create Space
        </ButtonSolidBlue>
        {isSubmitting && <Loader />}
      </Row>
      <ConfirmSubmit />
    </StyledForm>
  )
}
