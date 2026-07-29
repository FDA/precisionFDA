import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router'
import { Button } from '@/components/Button'
import { FieldGroup } from '@/components/form/FieldGroup'
import { Divider, InputError } from '@/components/form/form.styles'
import { InputText } from '@/components/InputText'
import { Loader } from '@/components/Loader'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { PageTitle } from '@/components/Page/page.styles'
import { StyledTagItem, StyledTags } from '@/components/Tags'
import { useEditTagsModal } from '@/features/actionModals/useEditTagsModal'
import { type EditSpacePayload, editSpaceRequest, spaceRequest } from '@/features/spaces/spaces.api'
import { SpaceTypeName } from '../common'
import type { ISpace } from '../spaces.types'
import { useSpaceActions } from '../useSpaceActions'
import { editValidationSchema } from './helpers'
import { HintText, Row, StyledButton, StyledForm, StyledPageCenter, StyledPageContent } from './spaces-form.styles'

const EditTags = ({ spaceId, tags = [] }: { spaceId: number; tags?: string[] }) => {
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
      <StyledTags data-testid="tags-container">
        {tags?.map(tag => (
          <StyledTagItem data-testid="space-tag-item" key={tag}>
            {tag}
          </StyledTagItem>
        ))}
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
  cts: string | null
  protected: boolean | null
}

export interface ISpaceSettingsForm {
  space: ISpace
}

export const SpaceSettingsForm = ({ space }: ISpaceSettingsForm) => {
  const queryClient = useQueryClient()
  const { actions, modals } = useSpaceActions({ space })
  const [formError, setFormError] = useState<string | undefined>()

  const lockUnlockAction = actions.find(action => action.name === 'Lock/Unlock')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SpaceSettingsVals>({
    mode: 'onBlur',
    resolver: yupResolver(editValidationSchema),
    defaultValues: {
      spaceType: space.type,
      name: space.name,
      description: space.description,
      hostLeadDxuser: space.host_lead?.dxuser,
      guestLeadDxuser: space.guest_lead?.dxuser,
      cts: space.cts,
      protected: space.protected,
    },
  })

  const mutation = useMutation({
    mutationKey: ['edit-space'],
    mutationFn: (payload: EditSpacePayload) => editSpaceRequest(space.id, payload),
    onSuccess: res => {
      if (res?.id) {
        queryClient.invalidateQueries({ queryKey: ['space', space.id.toString()] })
        toastSuccess('Space settings has been saved')
      } else if (res?.errors) {
        const errorMessages = res.errors.flatMap(error => error.messages || []).join('\r\n')
        toastError(`Error: ${errorMessages}`)
        setFormError(`Error: ${errorMessages}`)
      } else {
        toastError('Something went wrong')
      }
    },
    onError: () => {
      toastError('Error: Editing space settings')
    },
  })

  const onSubmit = handleSubmit(({ name, description, cts }) => {
    setFormError(undefined)
    mutation.mutate({ name, description, cts: cts ?? undefined })
  })
  const isSubmitting = mutation.isPending

  return (
    <StyledForm onSubmit={onSubmit}>
      {!lockUnlockAction?.shouldHide && (
        <div>
          <Button
            type="button"
            data-testid="lock-space-button"
            onClick={() => {
              if (lockUnlockAction?.type === 'modal') {
                lockUnlockAction.func()
              }
            }}
          >
            {space.links.unlock && 'Unlock Space'}
            {space.links.lock && 'Lock Space'}
          </Button>
          {modals['Lock/Unlock']}
        </div>
      )}
      <FieldGroup label="Space Type">
        <InputText data-testid="space-type" value={SpaceTypeName[space.type]} disabled />
      </FieldGroup>
      <FieldGroup label="Name" required>
        <InputText {...register('name')} disabled={isSubmitting} />
        <ErrorMessage errors={errors} name="name" render={({ message }) => <InputError>{message}</InputError>} />
      </FieldGroup>
      <FieldGroup label="Description" required>
        <InputText {...register('description')} disabled={isSubmitting} />
        <ErrorMessage errors={errors} name="description" render={({ message }) => <InputError>{message}</InputError>} />
      </FieldGroup>

      <EditTags spaceId={space.id} tags={space.tags} />

      {space.type === 'review' && (
        <FieldGroup label="Center Tracking System #">
          <InputText {...register('cts')} disabled={isSubmitting} />
          <HintText>
            FDA uses the Center Tracking System (CTS) to track the progress of industry submitted pre-market documents
            through the review process. CTS is a workflow/work management system that provides support for the Center
            for Devices and Radiogical Health (CDRH) business processes and business rules, for all stages of the
            product lifecycle for medical devices.
          </HintText>
          <ErrorMessage errors={errors} name="cts" render={({ message }) => <InputError>{message}</InputError>} />
          <Divider />
        </FieldGroup>
      )}

      <Row>
        <Button data-variant="primary" disabled={Object.keys(errors).length > 0 || isSubmitting} type="submit">
          Save
        </Button>
        {formError && <InputError>{formError}</InputError>}
      </Row>
    </StyledForm>
  )
}

export const SpaceSettings = () => {
  const { spaceId } = useParams<{ spaceId: string }>()
  const { data } = useQuery({
    queryKey: ['space', spaceId],
    queryFn: () => spaceRequest({ id: spaceId }),
  })

  if (!data?.space) {
    return <Loader />
  }

  return (
    <StyledPageCenter className="px-4 py-6 sm:px-8">
      <StyledPageContent>
        <PageTitle className="pt-2">Space Settings</PageTitle>
        <SpaceSettingsForm space={data.space} />
      </StyledPageContent>
    </StyledPageCenter>
  )
}
