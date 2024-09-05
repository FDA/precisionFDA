import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { Divider, InputError } from '../../../components/form/styles'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { BackLinkMargin } from '../../../components/Page/PageBackLink'
import { PageTitle } from '../../../components/Page/styles'
import { StyledTagItem, StyledTags } from '../../../components/Tags'
import { useEditTagsModal } from '../../actionModals/useEditTagsModal'
import { SpaceTypeName } from '../common'
import { CreateSpacePayload, editSpaceRequest, spaceRequest } from '../spaces.api'
import { ISpace } from '../spaces.types'
import { useSpaceActions } from '../useSpaceActions'
import { editValidationSchema } from './helpers'
import { HintText, Row, StyledButton, StyledForm, StyledPageCenter, StyledPageContent } from './styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { Button } from '../../../components/Button'

const EditTags = ({ spaceId, tags = [] }: { spaceId: number, tags?: string[] }) => {
  const queryClient = useQueryClient()
  const { modalComp: tagsModal, setShowModal: setTagsModal } = useEditTagsModal({
    resource: 'spaces',
    selected: { uid: `space-${spaceId}`, name: 'space', tags },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['space', spaceId.toString()],
      })
    },
  })

  return (
    <FieldGroup label="Tags">
      <StyledTags>
        {tags && tags.map(tag => <StyledTagItem key={tag}>{tag}</StyledTagItem>)}
        <StyledButton type="button" onClick={() => setTagsModal(true)}>
          Edit Tags
        </StyledButton>
      </StyledTags>
      {tagsModal}
    </FieldGroup>
  )
}

interface SpaceSettingsVals {
  spaceType: ISpace['type']
  name: string
  description: string
  sourceSpaceId: string | null
  guestLeadDxuser: string | null
  hostLeadDxuser: string | null
  sponsorLeadDxuser: string | null
  reviewLeadDxuser: string | null
  cts: string | null
  protected: boolean | null
}

export interface ISpaceSettingsForm {
  space: ISpace
  isEditing?: boolean
  defaultValues?: Partial<SpaceSettingsVals>
}

export const SpaceSettingsForm = ({ space }: ISpaceSettingsForm) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const spaceActions = useSpaceActions({ space })
  const [formError, setFormError] = useState<string | undefined>()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
  } = useForm<SpaceSettingsVals>({
    mode: 'onBlur',
    resolver: yupResolver(editValidationSchema),
    defaultValues: {
      spaceType: space.type,
      name: space.name,
      description: space.description,
      hostLeadDxuser: space.host_lead?.dxuser,
      guestLeadDxuser: space.guest_lead?.dxuser,
      sponsorLeadDxuser: space.guest_lead?.dxuser,
      cts: space.cts,
      protected: space.protected,
    },
  })

  const mutation = useMutation({
    mutationKey: ['edit-space'],
    mutationFn: (payload: CreateSpacePayload) => editSpaceRequest(space.id, payload),
    onSuccess: res => {
      if (res?.space) {
        navigate(`/spaces/${res?.space?.id}`)
        queryClient.invalidateQueries({
          queryKey: ['spaces'],
        })
        toast.success('Success: editing space settings')
      } else if (res?.errors) {
        toast.error(`Error: ${res.errors.messages.join('\r\n')}`)
        setFormError(`Error: ${res.errors.messages.join('\r\n')}`)
      } else {
        toast.error('Something went wrong')
      }
    },
    onError: () => {
      toast.error('Error: Editing space settings')
    },
  })

  const onSubmit = () => {
    setFormError(undefined)
    const vals = getValues()
    mutation.mutateAsync(vals)
  }
  const isSubmitting = mutation.isPending

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)}>
      {!spaceActions['Lock/Unlock']?.shouldHide && (
        <div>
          <Button type="button" data-testid="lock-space-button" onClick={() => spaceActions['Lock/Unlock']?.func()}>
            {space.links.unlock && 'Unlock Space'}
            {space.links.lock && 'Lock Space'}
          </Button>
          {spaceActions['Lock/Unlock']?.modal}
        </div>
      )}
      <FieldGroup label="Space Type">
        <InputText value={SpaceTypeName[space.type]} disabled />
      </FieldGroup>
      <FieldGroup label="Name" required>
        <InputText {...register('name', { required: 'Name is required.' })} disabled={isSubmitting} />
        <ErrorMessage errors={errors} name="name" render={({ message }) => <InputError>{message}</InputError>} />
      </FieldGroup>
      <FieldGroup label="Description" required>
        <InputText {...register('description')} disabled={isSubmitting} />
        <ErrorMessage errors={errors} name="description" render={({ message }) => <InputError>{message}</InputError>} />
      </FieldGroup>

      <EditTags spaceId={space.id} tags={space.tags} />

      {watch().spaceType === 'review' && (
        <>
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

      <Row>
        <Button data-variant="primary" disabled={Object.keys(errors).length > 0 || isSubmitting} type="submit">
          Save
        </Button>
        {isSubmitting && <Loader />}
        {formError && <InputError>{formError}</InputError>}
      </Row>
    </StyledForm>
  )
}

export const SpaceSettings = () => {
  const { spaceId } = useParams<{ spaceId: string }>()
  const { data } = useQuery({
    queryKey: ['space', spaceId],
    queryFn: () => spaceRequest({ id: spaceId as unknown as number }),
  })

  if (!data?.space) {
    return <Loader />
  }

  return (
    <UserLayout mainScroll>
      <StyledPageCenter>
        <StyledPageContent>
          <BackLinkMargin linkTo={`/spaces/${data.space.id}`}>Back to Space</BackLinkMargin>
          <PageTitle>Space Settings</PageTitle>
          <SpaceSettingsForm space={data.space} />
        </StyledPageContent>
      </StyledPageCenter>
    </UserLayout>
  )
}
