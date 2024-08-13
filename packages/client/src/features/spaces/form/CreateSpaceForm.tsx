import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { UseMutationResult } from '@tanstack/react-query'
import { Divider, FieldLabelRow, InputError } from '../../../components/form/styles'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { useAuthUser } from '../../auth/useAuthUser'
import { CreateSpacePayload, CreateSpaceResponse } from '../spaces.api'
import { ISpace } from '../spaces.types'
import { RadioButtonGroup } from '../../../components/form/RadioButtonGroup'
import { HintText, Row, StyledForm } from './styles'
import {
  getSpaceTypeOptions,
  SPACE_TYPE_HINT,
  validationSchema,
} from './helpers'
import { Checkbox } from '../../../components/CheckboxNext'
import { useConfirm } from '../../modal/useConfirm'
import { Button } from '../../../components/Button'

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
  restricted_reviewer: boolean | null
  restricted_discussions: boolean | null
}

export interface ISpaceForm {
  mutation: UseMutationResult<
    CreateSpaceResponse,
    unknown,
    CreateSpacePayload,
    unknown
  >
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
      protected: false,
      restricted_reviewer: null,
      restricted_discussions: null,
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

  //TODO(Jiri) - simplify this once all space types are migrated to node
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
      vals.restricted_discussions = vals.restricted_discussions ?? false
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
    const createSpaceRequest: CreateSpacePayload = {
      name: vals.name,
      description: vals.description,
      spaceType: vals.space_type,
      sourceSpaceId: vals.source_space_id,
      guestLeadDxuser: vals.guest_lead_dxuser,
      hostLeadDxuser: vals.host_lead_dxuser,
      sponsorLeadDxuser: vals.sponsor_lead_dxuser,
      cts: vals.cts,
      protected: vals.protected,
      restrictedReviewer: vals.restricted_reviewer,
      restrictedDiscussions: vals.restricted_discussions,
    }

    mutation.mutateAsync(createSpaceRequest)
  }

  const handleProtectedSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('protected', event.target.checked)
  }

  const handleRestrictedReviewer = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('restricted_reviewer', event.target.checked)
  }

  const handleRestrictedDiscussions = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('restricted_discussions', event.target.checked)
  }

  const isSubmitting = mutation.isPending

  const options = getSpaceTypeOptions({
    isAdmin,
    isGovUser,
    isReviewAdmin,
  })

  const getConfirmMessage = () => {
    const restrictions: string[] = []
    if (getValues().protected) {
      restrictions.push("protected")
    }
    if (getValues().restricted_reviewer) {
      restrictions.push("FDA-associated restricted")
    }
    if (getValues().restricted_discussions) {
      restrictions.push("Shared Area discussions restricted")
    }

    return "The space you are about to create will be " + restrictions.join(" and ")
  }

  const {
    open: openConfirmation,
    Confirm: ConfirmSubmit,
  } = useConfirm({
    onOk: handleSubmit(onSubmit),
    headerText: getConfirmMessage(),
    body: <p>Are you sure you would like to continue?</p>,
  })

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
            <FieldLabelRow>
              <Checkbox
                {...register('protected')}
                disabled={isSubmitting}
                onChange={handleProtectedSelection}
                checked={watch().protected || false}
              />
              Space Protection
            </FieldLabelRow>
            <HintText>
              <p>When checked, the space will be subject to the following restrictions:</p>
              <ul>
                <li>Data in this space cannot be copied to My Home or Private Spaces, nor downloaded, except by a lead of the space.</li>
                <li>Data in this space can only be copied to Spaces that also have protection enabled, and the copying user must be a lead member of both the source and destination spaces.</li>
                <li>Space protection cannot be disabled for a Space or be turned off by any member, not even the leads.</li>
              </ul>
            </HintText>
          </FieldGroup>
      )}

      {watch().space_type === 'review' && (
        <>
          <FieldGroup>
            <FieldLabelRow>
              <Checkbox
                {...register('restricted_reviewer')}
                disabled={isSubmitting}
                onChange={handleRestrictedReviewer}
                checked={watch().restricted_reviewer || undefined}
              />
              Restrict Reviewer side of Space to FDA users only
            </FieldLabelRow>
            <HintText>
              When checked, only users who have a @fda.hhs.gov or @fda.gov email associated with their account can be added.
            </HintText>
          </FieldGroup>
          <FieldGroup>
            <FieldLabelRow>
              <Checkbox
                {...register('restricted_discussions')}
                disabled={isSubmitting}
                onChange={handleRestrictedDiscussions}
                checked={watch().restricted_discussions || undefined}
              />
              Disable Shared Area Discussions
            </FieldLabelRow>
            <HintText>
              When checked, discussions in the Shared Area of the Space are disabled.
            </HintText>
          </FieldGroup>
          </>
      )}

      <Row>
        <Button
          data-variant='primary'
          disabled={Object.keys(errors).length > 0 || isSubmitting}
          type="button"
          onClick={getValues().protected || getValues().restricted_reviewer || getValues().restricted_discussions ? openConfirmation: handleSubmit(onSubmit)}
        >
          Create Space
        </Button>
        {isSubmitting && <Loader />}
      </Row>
      <ConfirmSubmit />
    </StyledForm>
  )
}
