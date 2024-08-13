import { ErrorMessage } from '@hookform/error-message'
import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { FieldGroup, InputError } from '../../../components/form/styles'
import { InputText } from '../../../components/InputText'
import { ButtonRow, Footer, StyledForm } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { editAssetRequest } from '../assets.api'
import { IAsset } from '../assets.types'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { Button } from '../../../components/Button'

const EditAssetInfoForm = ({
  asset,
  handleClose,
}: {
  asset: IAsset
  handleClose: () => void
}) => {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name:
        typeof asset?.origin == 'object'
          ? asset.origin.text?.trim()
          : asset.name.trim(),
    },
  })

  const editMutation = useMutation({
    mutationKey: ['edit-asset-info'],
    mutationFn: (payload: { name: string; uid: string }) =>
      editAssetRequest(payload),
    onSuccess: res => {
      if (res?.message.type === 'error') {
        toast.error(`API Error: ${res?.message.text}`)
      } else {
        queryClient.invalidateQueries({
          queryKey: ['assets'],
        })
        queryClient.invalidateQueries({
          queryKey: ['asset', asset.uid],
        })
        handleClose()
        toast.success('Asset info has been updated')
      }
    },
    onError: () => {
      toast.error('Error: Editing asset info')
    },
  })

  const onSubmit = (vals: any) => {
    editMutation.mutateAsync({ name: vals.name, uid: asset.uid })
  }

  return (
    <>
      <StyledForm id="edit-asset-form" onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <label>Asset Name</label>
          <InputText
            label="Asset Name"
            {...register('name', { required: 'Name is required.' })}
            placeholder="Edit name..."
            disabled={editMutation.isPending}
          />
          <ErrorMessage
            errors={errors}
            name="name"
            render={({ message }) => <InputError>{message}</InputError>}
          />
        </FieldGroup>
      </StyledForm>
      <Footer>
        <ButtonRow>
          <Button
            type="button"
            onClick={handleClose}
            disabled={editMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            data-variant="primary"
            type="submit"
            form="edit-asset-form"
            disabled={editMutation.isPending}
          >
            Edit
          </Button>
        </ButtonRow>
      </Footer>
    </>
  )
}

export const useEditAssetModal = (selectedItem: IAsset) => {
  const { isShown, setShowModal } = useModal()
  const selected = useMemo(() => selectedItem, [isShown])
  const handleClose = () => setShowModal(false)

  const modalComp = (
    <ModalNext
      data-testid="modal-asset-edit"
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText="Edit asset info"
        hide={() => setShowModal(false)}
      />
      <EditAssetInfoForm asset={selected} handleClose={handleClose} />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
