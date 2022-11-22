import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHistory, useParams } from 'react-router'
import { toast } from 'react-toastify'
import { ButtonOutlineGrey, ButtonSolidBlue } from '../../../components/Button'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { Divider, InputError } from '../../../components/form/styles'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { BackLinkMargin } from '../../../components/Page/PageBackLink'
import { PageTitle } from '../../../components/Page/styles'
import { StyledTagItem, StyledTags } from '../../../components/Tags'
import { useAuthUser } from '../../auth/useAuthUser'
import { useEditTagsModal } from '../../home/actionModals/useEditTagsModal'
import { SpaceTypeName } from '../common'
import {
  CreateSpacePayload,
  editSpaceRequest,
  spaceRequest,
} from '../spaces.api'
import { ISpace } from '../spaces.types'
import { useSpaceActions } from '../useSpaceActions'
import { validationSchema } from './helpers'
import { HintText, Row, StyledButton, StyledForm, StyledPageCenter, StyledPageContent } from './styles'


const EditTags = ({ spaceId, tags = []}: { spaceId: string, tags?: string[]}) => {
  const queryClient = useQueryClient()
  const {
    modalComp: tagsModal,
    setShowModal: setTagsModal,
  } = useEditTagsModal({
    resource: 'spaces',
    selected: { uid: `space-${spaceId}`, name: 'space', tags },
    onSuccess: () => {
      queryClient.invalidateQueries(['space', spaceId.toString()])
    },
  })

  return (
    <FieldGroup label="Tags">
      <StyledTags>
        {tags && tags.map(tag => (
          <StyledTagItem key={tag}>{tag}</StyledTagItem>
        ))}
        <StyledButton type="button" onClick={() => setTagsModal(true)}>Edit Tags</StyledButton>
      </StyledTags>
      {tagsModal}
    </FieldGroup>
  )
}


interface SpaceSettingsVals {
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

export interface ISpaceSettingsForm {
  space: ISpace
  isEditing?: boolean
  defaultValues?: Partial<SpaceSettingsVals>
}

export const SpaceSettingsForm = ({ space }: ISpaceSettingsForm) => {
  const user = useAuthUser()
  const history = useHistory()
  const queryClient = useQueryClient()
  const spaceActions = useSpaceActions({ space })
  const[formError, setFormError] = useState<string | undefined>()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
    setError,
  } = useForm<SpaceSettingsVals>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      space_type: space.type,
      name: space.name,
      description: space.description,
      host_lead_dxuser: space.host_lead?.dxuser,
      guest_lead_dxuser: space.guest_lead?.dxuser,
      review_lead_dxuser: space.host_lead?.dxuser,
      sponsor_lead_dxuser: space.guest_lead?.dxuser,
      cts: space.cts,
    },
  })

  const mutation = useMutation({
    mutationKey: ['edit-space'],
    mutationFn: (payload: CreateSpacePayload) =>
      editSpaceRequest(space.id, payload),
    onSuccess: res => {
      if (res?.space) {
        history.push(`/spaces/${res?.space?.id}`)
        queryClient.invalidateQueries(['spaces'])
        toast.success('Success: editing space settings.')
      } else if (res?.errors) {
          toast.error(`Error: ${res.errors.messages.join('\r\n')}`)
          setFormError(`Error: ${res.errors.messages.join('\r\n')}`)
        } else {
          toast.error('Something went wrong!')
        }
    },
    onError: () => {
      toast.error('Error: Editing space settings.')
    },
  })

  const onSubmit = () => {
    setFormError(undefined)
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
    vals.source_space_id = space.id
    mutation.mutateAsync(vals)
  }

  const isSubmitting = mutation.isLoading

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)}>
      {!spaceActions['Lock/Unlock']?.shouldHide && (
        <div>
          <ButtonOutlineGrey
            type="button"
            data-testid="lock-space-button"
            onClick={() => spaceActions['Lock/Unlock']?.func()}
          >
            {space.links.unlock && 'Unlock Space'}
            {space.links.lock && 'Lock Space'}
          </ButtonOutlineGrey>
          {spaceActions['Lock/Unlock']?.modal}
        </div>
      )}
      <FieldGroup label="Space Type">
        <InputText
          label="Space Type"
          value={SpaceTypeName[space.type]}
          disabled
        />
      </FieldGroup>
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

      <EditTags spaceId={space.id} tags={space.tags} />

      {watch().space_type === 'groups' && (
        <>
          <FieldGroup label="Host Lead">
            <InputText
              label="Host Lead"
              disabled
              {...register('host_lead_dxuser')}
            />
            <ErrorMessage
              errors={errors}
              name="host_lead_dxuser"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>
          <FieldGroup label="Guest Lead">
            <InputText
              label="Guest Lead"
              disabled
              {...register('guest_lead_dxuser')}
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
          <FieldGroup label="Reviewer Lead">
            <InputText
              label="Reviewer Lead"
              disabled={isSubmitting}
              {...register('review_lead_dxuser')}
            />
            <ErrorMessage
              errors={errors}
              name="review_lead_dxuser"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>

          <FieldGroup label="Sponsor Lead">
            <InputText
              label="Sponsor Lead"
              disabled
              {...register('sponsor_lead_dxuser')}
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
       {formError && <InputError>{formError}</InputError>}
      </Row>
    </StyledForm>
  )
}

export const SpaceSettings = () => {
  const { spaceId } = useParams<{ spaceId: string }>()
  const { data } = useQuery(['space', spaceId], () =>
    spaceRequest({ id: spaceId }),
  )

  if (!data?.space) {
    return <Loader />
  }

  return (
    <>
      <BackLinkMargin linkTo={`/spaces/${data.space.id}`}>Back to Space</BackLinkMargin>
      <StyledPageCenter>
        <StyledPageContent>
          <PageTitle>Space Settings</PageTitle>
          <SpaceSettingsForm space={data.space} />
        </StyledPageContent>
      </StyledPageCenter>
    </>
  )
}
