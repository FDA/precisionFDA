import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { UseMutationResult } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '../../../components/Button'
import { Checkbox } from '../../../components/Checkbox'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { RadioButtonGroup } from '../../../components/form/RadioButtonGroup'
import { Divider, FieldLabelRow, InputError } from '../../../components/form/styles'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { useAuthUser } from '../../auth/useAuthUser'
import { useConfirm } from '../../modal/useConfirm'
import { CreateSpacePayload, CreateSpaceResponse } from '../spaces.api'
import { getSpaceTypeOptions, SPACE_TYPE_HINT, validationSchema } from './helpers'
import { HintText, Row, StyledForm } from './styles'

export interface ISpaceForm {
  mutation: UseMutationResult<CreateSpaceResponse, unknown, CreateSpacePayload, unknown>
  defaultValues?: Partial<CreateSpacePayload>
}

export const SpaceForm = ({ mutation, defaultValues }: ISpaceForm) => {
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
  } = useForm<CreateSpacePayload>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      spaceType: 'private_type',
      name: '',
      description: '',
      hostLeadDxuser: '',
      guestLeadDxuser: '',
      cts: '',
      protected: false,
      restrictedReviewer: false,
      restrictedDiscussions: false,
      ...defaultValues,
    },
  })

  useEffect(() => {
    const stype = watch().spaceType
    if (stype !== 'review') {
      setValue('cts', '')
      clearErrors(['hostLeadDxuser', 'guestLeadDxuser', 'cts'])
      setValue('restrictedReviewer', false)
      setValue('restrictedDiscussions', false)
    }
    if (!['government', 'review', 'groups'].includes(stype.toString())) {
      setValue('protected', false)
    }
  }, [watch().spaceType])

  const onSubmit = () => {
    const vals = getValues()
    if (['private_type', 'administrator', 'government'].includes(vals.spaceType.toString())) {
      vals.hostLeadDxuser = user?.dxuser ?? ''
      vals.guestLeadDxuser = ''
    }

    mutation.mutateAsync(vals)
  }

  const handleProtectedSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('protected', event.target.checked)
  }

  const handleRestrictedReviewer = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('restrictedReviewer', event.target.checked)
  }

  const handleRestrictedDiscussions = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('restrictedDiscussions', event.target.checked)
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
      restrictions.push('protected')
    }
    if (getValues().restrictedReviewer) {
      restrictions.push('FDA-associated restricted')
    }
    if (getValues().restrictedDiscussions) {
      restrictions.push('Shared Area discussions restricted')
    }

    return `The space you are about to create will be ${restrictions.join(' and ')}`
  }

  const { open: openConfirmation, Confirm: ConfirmSubmit } = useConfirm({
    onOk: handleSubmit(onSubmit),
    headerText: getConfirmMessage(),
    body: <p>Are you sure you would like to continue?</p>,
  })

  return (
    <StyledForm>
      <FieldGroup label="Space type">
        <Controller
          name="spaceType"
          control={control}
          render={({ field: { value, onChange, onBlur } }) => (
            <RadioButtonGroup
              onChange={onChange}
              value={value}
              onBlur={onBlur}
              options={options}
              ariaLabel="Spaces option select"
            />
          )}
        />
        <ErrorMessage errors={errors} name="spaceType" render={({ message }) => <InputError>{message}</InputError>} />
        <HintText>{SPACE_TYPE_HINT[watch().spaceType]}</HintText>
      </FieldGroup>

      <Divider />

      <FieldGroup label="Name" required>
        <InputText {...register('name', { required: 'Name is required.' })} disabled={isSubmitting} />
        <ErrorMessage errors={errors} name="name" render={({ message }) => <InputError>{message}</InputError>} />
      </FieldGroup>
      <FieldGroup label="Description" required>
        <InputText {...register('description')} disabled={isSubmitting} />
        <ErrorMessage errors={errors} name="description" render={({ message }) => <InputError>{message}</InputError>} />
      </FieldGroup>

      {watch().spaceType === 'groups' && (
        <>
          <FieldGroup label="Host Lead" required>
            <InputText {...register('hostLeadDxuser')} disabled={isSubmitting} />
            <ErrorMessage errors={errors} name="hostLeadDxuser" render={({ message }) => <InputError>{message}</InputError>} />
          </FieldGroup>
          <FieldGroup label="Guest Lead" required>
            <InputText {...register('guestLeadDxuser')} disabled={isSubmitting} />
            <ErrorMessage errors={errors} name="guestLeadDxuser" render={({ message }) => <InputError>{message}</InputError>} />
          </FieldGroup>
        </>
      )}

      {watch().spaceType === 'review' && (
        <>
          <FieldGroup label="Reviewer Lead" required>
            <InputText {...register('hostLeadDxuser')} disabled={isSubmitting} />
            <ErrorMessage errors={errors} name="hostLeadDxuser" render={({ message }) => <InputError>{message}</InputError>} />
          </FieldGroup>

          <FieldGroup label="Sponsor Lead" required>
            <InputText {...register('guestLeadDxuser')} disabled={isSubmitting} />
            <ErrorMessage errors={errors} name="guestLeadDxuser" render={({ message }) => <InputError>{message}</InputError>} />
          </FieldGroup>

          <FieldGroup label="Center Tracking System #">
            <InputText {...register('cts')} disabled={isSubmitting} />
            <HintText>
              FDA uses the Center Tracking System (CTS) to track the progress of industry submitted pre-market documents through
              the review process. CTS is a workflow/work management system that provides support for the Center for Devices and
              Radiogical Health (CDRH) business processes and business rules, for all stages of the product lifecycle for medical
              devices.
            </HintText>
            <ErrorMessage errors={errors} name="cts" render={({ message }) => <InputError>{message}</InputError>} />
            <Divider />
          </FieldGroup>
        </>
      )}

      {['review', 'groups', 'government'].includes(watch().spaceType as string) && (
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
            <p>The space will be subject to the following restrictions:</p>
            <ul>
              <li>Data cannot be copied to My Home or Private Spaces, or downloaded, except by a space lead.</li>
              <li>
                Data can only be copied to other protected Spaces, and the user must be a lead in both source and destination
                spaces.
              </li>
              <li>Space protection cannot be disabled or turned off by any member, including leads.</li>
            </ul>
          </HintText>
        </FieldGroup>
      )}

      {watch().spaceType === 'review' && (
        <>
          <FieldGroup>
            <FieldLabelRow>
              <Checkbox
                {...register('restrictedReviewer')}
                disabled={isSubmitting}
                onChange={handleRestrictedReviewer}
                checked={watch().restrictedReviewer || false}
              />
              Restrict Reviewer side of Space to FDA users only
            </FieldLabelRow>
            <HintText>Only users with an @fda.hhs.gov or @fda.gov email linked to their account can be added.</HintText>
          </FieldGroup>
          <FieldGroup>
            <FieldLabelRow>
              <Checkbox
                {...register('restrictedDiscussions')}
                disabled={isSubmitting}
                onChange={handleRestrictedDiscussions}
                checked={watch().restrictedDiscussions || false}
              />
              Disable Shared Area Discussions
            </FieldLabelRow>
            <HintText>Discussions in the Shared Area of the Space will be disabled for everyone.</HintText>
          </FieldGroup>
        </>
      )}

      <Row>
        <Button
          data-variant="primary"
          disabled={Object.keys(errors).length > 0 || isSubmitting}
          type="button"
          onClick={
            getValues().protected || getValues().restrictedReviewer || getValues().restrictedDiscussions
              ? openConfirmation
              : handleSubmit(onSubmit)
          }
        >
          Create Space
        </Button>
        {isSubmitting && <Loader />}
      </Row>
      <ConfirmSubmit />
    </StyledForm>
  )
}
