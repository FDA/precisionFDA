import { ErrorMessage } from '@hookform/error-message'
import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { Button, ButtonSolidBlue } from '../../../../components/Button'
import { FieldGroup, InputError } from '../../../../components/form/styles'
import { InputText } from '../../../../components/InputText'
import { Modal } from '../../../modal'
import { ButtonRow, StyledForm } from '../../../modal/styles'
import { useModal } from '../../../modal/useModal'
import { editAssetRequest } from '../assets.api'
import { IAsset } from '../assets.types'


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
      name: typeof asset?.origin == 'object' ? asset.origin.text?.trim() : asset.name.trim(),
    },
  })

  const editMutation = useMutation({
    mutationFn: (payload: { name: string; uid: string }) => editAssetRequest(payload),
    onSuccess: (res) => {
      if(res?.message.type === 'error') {
        toast.error(`API Error: ${res?.message.text}`)
      } else {
        queryClient.invalidateQueries('assets')
        queryClient.invalidateQueries(['asset', asset.uid])
        handleClose()
        toast.success('Success: Editing asset info.')
      }
    },
    onError: () => {
      toast.error('Error: Editing asset info.')
    },
  })

  const onSubmit = (vals: any) => {
    editMutation.mutateAsync({ name: vals.name, uid: asset.uid })
  }

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <label>Asset Name</label>
        <InputText
          label="Asset Name"
          {...register('name', { required: 'Name is required.' })}
          placeholder="Edit name..."
          disabled={editMutation.isLoading}
        />
        <ErrorMessage
          errors={errors}
          name="name"
          render={({ message }) => <InputError>{message}</InputError>}
        />
      </FieldGroup>
      <ButtonRow>
        <Button type="button" onClick={handleClose} disabled={editMutation.isLoading}>Cancel</Button>
        <ButtonSolidBlue type="submit" disabled={editMutation.isLoading}>Edit</ButtonSolidBlue>
      </ButtonRow>
    </StyledForm>
  )
}

export const useEditAssetModal = (selectedItem: IAsset) => {
  const { isShown, setShowModal } = useModal()
  const selected = useMemo(() => selectedItem, [isShown])
  const handleClose = () => setShowModal(false)

  const modalComp = (
    <Modal
      data-testid="modal-asset-edit"
      headerText="Edit asset info"
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <EditAssetInfoForm asset={selected} handleClose={handleClose} />
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
