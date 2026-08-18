import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type React from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { getBackendErrorMessage } from '@/api/types'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useModal } from '../../modal/useModal'
import { fetchSpaceMemberships } from '../../spaces/members/members.api'
import type { MemberSideV2, SpaceMembershipV2 } from '../../spaces/members/members.types'
import type { ISpaceV2 } from '../../spaces/spaces.types'
import { recoverSpaceLeadRequest } from './api'

type CurrentLeadOption = { label: string; value: number; username: string }

const getMembershipSide = (side: MemberSideV2, spaceType: ISpaceV2['type']) => {
  if (spaceType === 'review') {
    return side === 'HOST' ? 'REVIEWER' : 'SPONSOR'
  }
  return side
}

const buildLeadOptions = (spaceMemberships: SpaceMembershipV2[], spaceType: ISpaceV2['type']): CurrentLeadOption[] =>
  spaceMemberships
    // Inactive memberships are rejected by the backend, so don't offer them
    .filter(member => member.role === 'LEAD' && member.active)
    .map(member => ({
      value: member.id,
      label: `${member.username} (${getMembershipSide(member.side, spaceType)})`,
      username: member.username,
    }))

export const recoverLeadValidationSchema = Yup.object().shape({
  currentLead: Yup.object()
    .shape({
      value: Yup.number().required(),
      label: Yup.string().required(),
      username: Yup.string().required(),
    })
    // Without an undefined default, yup casts a missing value to an object of the shape's
    // defaults, so the inner required tests fire instead of this message.
    .default(undefined)
    .required('Current Lead is required'),
  newLeadDxuser: Yup.string()
    .trim()
    .required('New Lead is required')
    .test('not-already-lead', 'The user is already a lead in the space', function (value) {
      const { leadOptions } = this.options.context || {}
      const newLead = value?.toLowerCase()
      return !leadOptions?.some((lead: CurrentLeadOption) => lead.username.toLowerCase() === newLead)
    }),
})

interface RecoverLeadFormValues {
  currentLead: CurrentLeadOption
  newLeadDxuser: string
}

const RecoverSpaceLeadForm = ({ space, onClose }: { space: ISpaceV2; onClose: () => void }): React.JSX.Element => {
  const queryClient = useQueryClient()
  const { data: spaceMemberships = [], isLoading } = useQuery({
    queryKey: ['space-memberships', space.id],
    queryFn: () => fetchSpaceMemberships(space.id),
  })

  const leadOptions = buildLeadOptions(spaceMemberships, space.type)

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    register,
  } = useForm<RecoverLeadFormValues>({ resolver: yupResolver(recoverLeadValidationSchema), context: { leadOptions } })

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
      queryClient.invalidateQueries({
        queryKey: ['space-memberships', space.id],
      })
    },
    onError: error => {
      toastError(`Recover space lead failed. ${getBackendErrorMessage(error, 'Unknown error')}`)
    },
  })

  const onSubmit = (data: RecoverLeadFormValues) => {
    mutation.mutate({ currentLeadMembershipId: data.currentLead.value, newLeadDxuser: data.newLeadDxuser })
  }
  const onCancel = () => {
    reset()
    onClose()
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  const isSubmitting = mutation.isPending
  return (
    <form className="flex min-h-0 flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto p-1">
        <div className="flex flex-col gap-2">
          <Label htmlFor="recover-space-lead-space-name">Space name</Label>
          <Input id="recover-space-lead-space-name" value={space.name} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="recover-space-lead-space-type">Space type</Label>
          <Input id="recover-space-lead-space-type" value={space.type} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="select_current_lead">Current Lead user</Label>
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
                      aria-invalid={Boolean(errors.currentLead)}
                    />
                    <ComboboxContent side="bottom" align="start">
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
            render={({ message }) => <p className="text-sm text-destructive">{message}</p>}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="recover-space-lead-new-user">New Lead user</Label>
          <Input
            id="recover-space-lead-new-user"
            {...register('newLeadDxuser')}
            placeholder=""
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.newLeadDxuser)}
          />
          <ErrorMessage
            errors={errors}
            name="newLeadDxuser"
            render={({ message }) => <p className="text-sm text-destructive">{message}</p>}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting} aria-label="Close modal">
          Cancel
        </Button>
        <Button type="submit" disabled={Object.keys(errors).length > 0 || isSubmitting} aria-label="Recover space lead">
          Recover Lead
        </Button>
      </DialogFooter>
    </form>
  )
}

export const useRecoverSpaceLeadModal = ({ space }: { space: ISpaceV2 }) => {
  const { isShown, setShowModal } = useModal()

  const onClose = () => setShowModal(false)

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent
        id="modal-recover-space-lead"
        data-testid="modal-recover-space-lead"
        variant="medium"
        className="gap-4"
      >
        <DialogHeader>
          <DialogTitle>Recover Space Lead</DialogTitle>
        </DialogHeader>
        <RecoverSpaceLeadForm space={space} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )

  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
