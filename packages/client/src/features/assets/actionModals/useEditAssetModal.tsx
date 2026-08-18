import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useModal } from '../../modal/useModal'
import { editAssetRequest } from '../assets.api'
import type { IAsset } from '../assets.types'

const EditAssetInfoForm = ({ asset, handleClose }: { asset: IAsset; handleClose: () => void }) => {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ name: string }>({
    defaultValues: {
      name: typeof asset?.origin == 'object' ? asset.origin.text?.trim() : asset.name.trim(),
    },
  })

  const editMutation = useMutation({
    mutationKey: ['edit-asset-info'],
    mutationFn: (payload: { name: string; uid: string }) => editAssetRequest(payload),
    onSuccess: res => {
      if (res?.message.type === 'error') {
        toastError(`API Error: ${res?.message.text}`)
      } else {
        queryClient.invalidateQueries({
          queryKey: ['assets'],
        })
        queryClient.invalidateQueries({
          queryKey: ['asset', asset.uid],
        })
        handleClose()
        toastSuccess('Asset info has been updated')
      }
    },
    onError: () => {
      toastError('Error: Editing asset info')
    },
  })

  const onSubmit = (vals: { name: string }) => {
    editMutation.mutateAsync({ name: vals.name, uid: asset.uid })
  }

  return (
    <>
      <form id="edit-asset-form" className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="edit-asset-name">Asset Name</FieldLabel>
          <Input
            id="edit-asset-name"
            {...register('name', { required: 'Name is required.' })}
            placeholder="Edit name..."
            disabled={editMutation.isPending}
            aria-invalid={Boolean(errors.name)}
          />
          <FieldError errors={[errors.name]} />
        </Field>
      </form>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={handleClose} disabled={editMutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" form="edit-asset-form" disabled={editMutation.isPending}>
          Edit
        </Button>
      </DialogFooter>
    </>
  )
}

export const useEditAssetModal = (selectedItem: IAsset) => {
  const { isShown, setShowModal } = useModal()
  const selected = useMemo(() => selectedItem, [isShown])
  const handleClose = () => setShowModal(false)

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent id="modal-asset-edit" data-testid="modal-asset-edit" variant="small" className="gap-4">
        <DialogHeader>
          <DialogTitle>Edit asset info</DialogTitle>
        </DialogHeader>
        <EditAssetInfoForm asset={selected} handleClose={handleClose} />
      </DialogContent>
    </Dialog>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
