import { ErrorMessage } from '@hookform/error-message'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FieldGroup, InputError } from '../../../components/form/form.styles'
import { InputText } from '../../../components/InputText'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'
import type { HomeScope } from '../../home/types'
import { useConditionalModal } from '../../modal/useModal'
import { addFolderRequest } from '../files.api'

type FolderModalArgs = {
  folderId?: string
  spaceId?: string
  homeScope?: HomeScope
  isAllowed: boolean
  onViolation: () => void
}

export const useAddFolderModal = ({ folderId, spaceId, homeScope, isAllowed, onViolation }: FolderModalArgs) => {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useConditionalModal(isAllowed, onViolation)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm({ defaultValues: { name: '' } })
  const mutation = useMutation({
    mutationKey: ['add-folder'],
    mutationFn: (payload: { name: string }) => addFolderRequest(payload, folderId, spaceId, homeScope),
    onSuccess: res => {
      if (res?.message?.type === 'error') {
        const errorMessage = res.message?.text ?? 'Unknown error adding folder'
        setError('name', { message: errorMessage, type: 'validate' })
        toastError(errorMessage)
        return
      }
      reset()
      queryClient.invalidateQueries({
        queryKey: ['files'],
      })
      setShowModal(false)
      toastSuccess('Folder has been created')
    },
    onError: () => {
      toastError('Error: Adding folder')
    },
  })

  const onSubmit = (vals: { name: string }) => {
    mutation.mutateAsync({ name: vals.name })
  }

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && mutation.isPending) {
        return
      }
      setShowModal(open)
    },
    [mutation.isPending, setShowModal],
  )

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={handleOpenChange}>
      <DialogContent id="modal-files-add-folder" data-testid="modal-files-add-folder">
        <DialogHeader>
          <DialogTitle>Create new folder</DialogTitle>
          <DialogDescription className="sr-only">Enter a name for the new folder.</DialogDescription>
        </DialogHeader>
        <form id="add-folder-form" className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <label htmlFor="add-folder-name">Folder name</label>
            <InputText
              id="add-folder-name"
              {...register('name')}
              placeholder="Enter Name..."
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              disabled={mutation.isPending}
            />
            <ErrorMessage errors={errors} name="name" render={({ message }) => <InputError>{message}</InputError>} />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="add-folder-form" disabled={mutation.isPending}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
  return {
    modalComp,
    setShowModal,
  }
}
