import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type React from 'react'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { getBackendErrorMessage } from '@/api/types'
import { Button } from '@/components/Button'
import { FieldGroup, InputError } from '@/components/form/form.styles'
import { InputText } from '@/components/InputText'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { ModalHeaderTop, ModalNext, useModalFloatingPortalHost } from '../../modal/ModalNext'
import { Footer } from '../../modal/modal.styles'
import { useModal } from '../../modal/useModal'
import { fetchSpaceMemberships } from '../../spaces/members/members.api'
import { StyledFields } from '../../spaces/members/members.styles'
import type { MemberSideV2, SpaceMembershipV2 } from '../../spaces/members/members.types'
import type { ISpaceV2 } from '../../spaces/spaces.types'
import { recoverSpaceLeadRequest } from './api'

const validationSchema = Yup.object().shape({
  currentLead: Yup.object()
    .shape({
      value: Yup.number().required(),
      label: Yup.string().required(),
    })
    .required('Current Lead is required'),
  newLeadDxuser: Yup.string()
    .required('New Lead is required')
    .test('not-already-lead', 'The user is already a lead in the space', function (value) {
      const { leadOptions } = this.options.context || {}
      return !leadOptions?.some((m: { label: string; value: number }) => m.label.includes(value))
    }),
})

type CurrentLeadOption = { label: string; value: number }

interface RecoverLeadFormValues {
  currentLead: CurrentLeadOption
  newLeadDxuser: string
}

const RecoverSpaceLeadForm = ({ space, onClose }: { space: ISpaceV2; onClose: () => void }): React.JSX.Element => {
  const floatingPortalHost = useModalFloatingPortalHost()
  const queryClient = useQueryClient()
  const { data: spaceMemberships = [], isLoading } = useQuery({
    queryKey: ['space-memberships', space.id],
    queryFn: () => fetchSpaceMemberships(space.id),
  })

  const getMembershipSide = (side: MemberSideV2) => {
    if (space.type === 'review') {
      return side === 'HOST' ? 'REVIEWER' : 'SPONSOR'
    }
    return side
  }
  const leadOptions = useMemo(() => {
    const leadUsers = spaceMemberships.filter((member: SpaceMembershipV2) => member.role === 'LEAD')
    return leadUsers.map((member: SpaceMembershipV2) => ({
      value: member.id,
      label: `${member.username} (${getMembershipSide(member.side)})`,
    }))
  }, [spaceMemberships, space])

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    register,
  } = useForm<RecoverLeadFormValues>({ resolver: yupResolver(validationSchema), context: { leadOptions } })

  const mutation = useMutation({
    mutationFn: ({
      currentLeadMembershipId,
      newLeadDxuser,
    }: {
      currentLeadMembershipId: number
      newLeadDxuser: string
    }) => recoverSpaceLeadRequest(space.id, currentLeadMembershipId, newLeadDxuser),
    onSuccess: () => {
      toastSuccess('Recovered space lead successfully')
      reset()
      onClose()
      queryClient.invalidateQueries({
        queryKey: ['spaces'],
      })
    },
    onError: error => {
      toastError(`Recover space lead failed. ${getBackendErrorMessage(error, 'Unknown error')}`)
    },
  })

  const onSubmit = (data: RecoverLeadFormValues) => {
    mutation.mutateAsync({ currentLeadMembershipId: data.currentLead.value, newLeadDxuser: data.newLeadDxuser })
  }
  const onCancel = () => {
    reset()
    onClose()
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  const isSubmitting = mutation.isPending
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StyledFields>
        <FieldGroup>
          <label htmlFor="recover-space-lead-space-name">Space name</label>
          <InputText id="recover-space-lead-space-name" value={space.name} disabled />
        </FieldGroup>
        <FieldGroup>
          <label htmlFor="recover-space-lead-space-type">Space type</label>
          <InputText id="recover-space-lead-space-type" value={space.type} disabled />
        </FieldGroup>
        <FieldGroup>
          <label htmlFor="select_current_lead">Current Lead user</label>
          <Controller
            name="currentLead"
            control={control}
            render={({ field }) => {
              const current = field.value ?? null
              return (
                <div data-testid="recover-space-current-lead-combobox">
                  <Combobox<CurrentLeadOption>
                    name={String(field.name)}
                    required
                    items={leadOptions}
                    value={current}
                    onValueChange={next => {
                      if (next != null) {
                        field.onChange(next)
                      }
                      field.onBlur()
                    }}
                    isItemEqualToValue={(a, b) => a.value === b.value}
                    disabled={isSubmitting}
                    inputRef={field.ref}
                  >
                    <ComboboxInput
                      id="select_current_lead"
                      placeholder="Choose…"
                      className="relative max-w-full"
                      disabled={isSubmitting}
                      onBlur={field.onBlur}
                    />
                    <ComboboxContent side="bottom" align="start" container={floatingPortalHost ?? undefined}>
                      <ComboboxEmpty>No leads match.</ComboboxEmpty>
                      <ComboboxList>
                        {(item: CurrentLeadOption) => (
                          <ComboboxItem key={item.value} value={item}>
                            {item.label}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
              )
            }}
          />
          <ErrorMessage
            errors={errors}
            name="currentLead"
            render={({ message }) => <InputError>{message}</InputError>}
          />
        </FieldGroup>
        <FieldGroup>
          <label htmlFor="recover-space-lead-new-user">New Lead user</label>
          <InputText
            id="recover-space-lead-new-user"
            {...register('newLeadDxuser')}
            placeholder=""
            disabled={isSubmitting}
          />
          <ErrorMessage
            errors={errors}
            name="newLeadDxuser"
            render={({ message }) => <InputError>{message}</InputError>}
          />
        </FieldGroup>
      </StyledFields>
      <Footer>
        <div className="flex align-center gap-2">
          <Button type="button" onClick={onCancel} disabled={isSubmitting} aria-label="Close modal">
            Cancel
          </Button>
          <Button
            data-variant="primary"
            type="submit"
            disabled={Object.keys(errors).length > 0 || isSubmitting}
            aria-label="Recover space lead"
          >
            Recover Lead
          </Button>
        </div>
      </Footer>
    </form>
  )
}

export const useRecoverSpaceLeadModal = ({ space }: { space: ISpaceV2 }) => {
  const { isShown, setShowModal } = useModal()

  const onClose = () => setShowModal(false)

  const modalComp = isShown && (
    <ModalNext
      id="modal-recover-space-lead"
      data-testid="modal-recover-space-lead"
      isShown={isShown}
      hide={() => setShowModal(false)}
      variant="medium"
    >
      <ModalHeaderTop disableClose={false} headerText="Recover Space Lead" hide={() => setShowModal(false)} />
      <RecoverSpaceLeadForm space={space} onClose={onClose} />
    </ModalNext>
  )

  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
