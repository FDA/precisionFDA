import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type React from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/utils/cn'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'
import type { ApiRailsError } from '../../home/types'
import { useModal } from '../../modal/useModal'
import { addMembersToSpaceRequest } from './members.api'
import type { MemberRole } from './members.types'

interface FormValues {
  invitees_role: { label: string; value: MemberRole }
  invitees: string
}

const MEMBER_ROLE_OPTIONS: { value: MemberRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'contributor', label: 'Contributor' },
  { value: 'viewer', label: 'Viewer' },
]

const validationSchema = Yup.object().shape({
  invitees: Yup.string().required('Username(s) required'),
  invitees_role: Yup.object()
    .shape({
      value: Yup.string().required('Role required'),
    })
    .required('Required'),
})

interface AddMembersFormProps {
  spaceId: string
  onClose: () => void
}

const AddMembersForm: React.FC<AddMembersFormProps> = ({ spaceId, onClose }) => {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      invitees: '',
      invitees_role: { value: 'viewer', label: 'Viewer' },
    },
    resolver: yupResolver(validationSchema),
  })
  const mutation = useMutation({
    mutationKey: ['add-members-to-space'],
    mutationFn: ({ invitees, invitees_role }: FormValues) =>
      addMembersToSpaceRequest({
        spaceId,
        invitees: invitees.toLowerCase(),
        invitees_role: invitees_role.value,
      }),
    onSuccess: () => {
      reset()
      queryClient.invalidateQueries({
        queryKey: ['space-members'],
      })
      queryClient.invalidateQueries({
        queryKey: ['space', spaceId.toString()],
      })
      onClose()
      toastSuccess('Success: Adding members')
    },
    onError: (e: AxiosError<ApiRailsError>) => {
      toastError(`Error: Adding members. ${e.response?.data.errors}`)
    },
  })

  const onSubmit = ({ invitees_role, invitees }: FormValues) => {
    mutation.mutateAsync({ invitees, invitees_role })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label htmlFor="modal-add-members-invitees" className="text-sm font-medium text-foreground">
            Username List
          </label>
          <Input
            {...register('invitees')}
            id="modal-add-members-invitees"
            placeholder=""
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            disabled={mutation.isPending}
            aria-invalid={errors.invitees ? true : undefined}
          />
          <p className="text-muted-foreground text-sm leading-5">
            Enter usernames or emails seperated by commas. For example: first_user, second_user, third_user@email.com
          </p>
          <ErrorMessage
            errors={errors}
            name="invitees"
            render={({ message }) => <p className="text-destructive text-sm leading-5">{message}</p>}
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="modal-add-members-role" className="text-sm font-medium text-foreground">
            Role
          </label>
          <Controller
            name="invitees_role"
            control={control}
            render={({ field }) => {
              const disabled = mutation.isPending
              return (
                <Select
                  id="modal-add-members-role"
                  name={String(field.name)}
                  modal={false}
                  items={MEMBER_ROLE_OPTIONS}
                  value={field.value?.value ?? null}
                  onOpenChange={open => {
                    if (!open) field.onBlur()
                  }}
                  onValueChange={v => {
                    const chosen = MEMBER_ROLE_OPTIONS.find(o => o.value === v)
                    field.onChange(chosen ?? null)
                  }}
                  disabled={disabled}
                >
                  <SelectTrigger
                    className={cn('w-full min-w-0 justify-between')}
                    ref={field.ref}
                    aria-invalid={errors.invitees_role ? true : undefined}
                  >
                    <SelectValue placeholder="Choose…" />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="start">
                    {MEMBER_ROLE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            }}
          />
          <p className="text-muted-foreground text-sm leading-5">Select the new members role</p>
          <ErrorMessage
            errors={errors}
            name="invitees_role"
            render={({ message }) => <p className="text-destructive text-sm leading-5">{message}</p>}
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            reset()
            onClose()
          }}
          disabled={mutation.isPending}
          aria-label="Close modal"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={Object.keys(errors).length > 0 || mutation.isPending}
          aria-label="Submit add members"
        >
          Add Members
        </Button>
      </DialogFooter>
    </form>
  )
}

export const useAddMembersModal = ({ spaceId }: { spaceId: string }) => {
  const { isShown, setShowModal } = useModal()
  const modalComp = isShown && (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent id="modal-add-members" data-testid="modal-add-members" variant="medium">
        <DialogHeader>
          <DialogTitle>Add members to space</DialogTitle>
        </DialogHeader>
        <AddMembersForm spaceId={spaceId} onClose={() => setShowModal(false)} />
      </DialogContent>
    </Dialog>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
