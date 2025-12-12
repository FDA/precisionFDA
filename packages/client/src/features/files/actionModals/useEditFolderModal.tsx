import { ErrorMessage } from '@hookform/error-message'
import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FieldGroup, InputError } from '../../../components/form/styles'
import { InputText } from '../../../components/InputText'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer, StyledForm } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { editFolderRequest } from '../files.api'
import { IFile } from '../files.types'
import { Button } from '../../../components/Button'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'

const EditFolderInfoForm = ({ folder, handleClose }: { folder: IFile; handleClose: () => void }) => {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    defaultValues: {
      name: folder?.name,
    },
  })

  const mutation = useMutation({
    mutationKey: ['edit-folder'],
    mutationFn: async (payload: { name: string; folderId: number }) => editFolderRequest(payload),
    onSuccess: res => {
      if (res?.error?.type) {
        // parsing the error from backend to human-readable message
        // eslint-disable-next-line no-useless-escape
        setError('name', { message: res.error.message.replace(/[\[\]"]+/g, ''), type: 'validate' })
        return
      }
      queryClient.invalidateQueries({
        queryKey: ['files'],
      })
      handleClose()
      toastSuccess('Folder info changed')
    },
    onError: () => {
      toastError('Error: Editing folder info')
    },
  })

  const onSubmit = async (vals: { name: string }) => {
    await mutation.mutateAsync({ name: vals.name, folderId: folder.id })
  }

  return (
    <>
      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <label>Folder Name</label>
          <InputText
            {...register('name', { required: 'Name is required.' })}
            placeholder="Edit name..."
            disabled={isSubmitting}
          />
          <ErrorMessage errors={errors} name="name" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
      </StyledForm>
      <Footer>
        <ButtonRow>
          <Button type="button" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button data-variant="primary" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            Edit
          </Button>
        </ButtonRow>
      </Footer>
    </>
  )
}

export const useEditFolderModal = (selectedItem: IFile) => {
  const { isShown, setShowModal } = useModal()
  const selected = useMemo(() => selectedItem, [isShown])
  const handleClose = () => setShowModal(false)

  const modalComp = (
    <ModalNext
      id="modal-folder-edit"
      data-testid="modal-folder-edit"
      headerText="Edit folder info"
      isShown={isShown}
      hide={() => setShowModal(false)}
      variant="small"
    >
      <ModalHeaderTop headerText="Edit folder info" hide={() => setShowModal(false)} />
      <EditFolderInfoForm folder={selected} handleClose={handleClose} />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
