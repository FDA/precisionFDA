import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { getBackendErrorMessage } from '@/api/types'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useModal } from '../../../modal/useModal'
import { editInvitationBasicInfo, type Invitation } from '../../users/api'

const editInvitationSchema = Yup.object().shape({
  firstName: Yup.string().min(1).max(255).required(),
  lastName: Yup.string().min(1).max(255).required(),
  email: Yup.string().email().min(1).max(255).required(),
})

const EditInvitationInfoForm = ({ invitation, handleClose }: { invitation: Invitation; handleClose: () => void }) => {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(editInvitationSchema),
    defaultValues: {
      firstName: invitation?.firstName,
      lastName: invitation?.lastName,
      email: invitation?.email,
    },
  })

  const editInvitationMutation = useMutation({
    mutationKey: ['edit-invitation', invitation.id],
    mutationFn: (payload: { firstName: string; lastName: string; email: string }) =>
      editInvitationBasicInfo(invitation.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-invitations'],
      })
      handleClose()
      toastSuccess('Updated invitation information successfully')
    },
    onError: error => {
      toastError(getBackendErrorMessage(error, 'Failed to update invitation information'))
    },
  })

  const onSubmit = (vals: { firstName: string; lastName: string; email: string }) => {
    return editInvitationMutation.mutateAsync({
      firstName: vals.firstName,
      lastName: vals.lastName,
      email: vals.email,
    })
  }

  return (
    <>
      <div className="min-h-0 overflow-y-auto p-1">
        <form id="edit-invitation-form" className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-invitation-first-name">First Name</Label>
            <Input
              id="edit-invitation-first-name"
              {...register('firstName', { required: 'First Name is required.' })}
              placeholder="Enter first name..."
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.firstName)}
            />
            <ErrorMessage
              errors={errors}
              name="firstName"
              render={({ message }) => <p className="text-sm text-destructive">{message}</p>}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-invitation-last-name">Last Name</Label>
            <Input
              id="edit-invitation-last-name"
              {...register('lastName', { required: 'Last Name is required.' })}
              placeholder="Enter last name..."
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.lastName)}
            />
            <ErrorMessage
              errors={errors}
              name="lastName"
              render={({ message }) => <p className="text-sm text-destructive">{message}</p>}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-invitation-email">Email</Label>
            <Input
              id="edit-invitation-email"
              {...register('email', { required: 'Email is required.' })}
              placeholder="Enter email..."
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.email)}
            />
            <ErrorMessage
              errors={errors}
              name="email"
              render={({ message }) => <p className="text-sm text-destructive">{message}</p>}
            />
          </div>
        </form>
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" form="edit-invitation-form" disabled={isSubmitting}>
          Edit
        </Button>
      </DialogFooter>
    </>
  )
}

export const useEditInvitationModal = (selectedItem: Invitation) => {
  const { isShown, setShowModal } = useModal()
  const selected = useMemo(() => selectedItem, [isShown])
  const handleClose = () => {
    setShowModal(false)
  }
  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent id="modal-invitation-edit" data-testid="modal-invitation-edit" variant="small" className="gap-4">
        <DialogHeader>
          <DialogTitle>Edit invitation info</DialogTitle>
        </DialogHeader>
        <EditInvitationInfoForm invitation={selected} handleClose={handleClose} />
      </DialogContent>
    </Dialog>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
