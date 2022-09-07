import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { ErrorMessage } from '@hookform/error-message'
import { Button, ButtonSolidBlue } from '../../../../components/Button'
import { FieldGroup, InputError } from '../../../../components/form/styles'
import { InputText } from '../../../../components/InputText'
import { Modal } from '../../../modal'
import { ButtonRow, StyledForm } from '../../../modal/styles'
import { useModal } from '../../../modal/useModal'
import { editFileRequest } from '../files.api'
import { IFile } from '../files.types'

const EditFileInfoForm = ({
  file,
  handleClose,
}: {
  file: IFile
  handleClose: () => void
}) => {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    defaultValues: {
      name: file?.name,
      description: file?.description,
    },
  })

  const editFileMutation = useMutation({
    mutationFn: (payload: {
      name: string
      description: string
      fileId: string
    }) => editFileRequest(payload),
    onSuccess: res => {
      if(res?.message?.type === 'error') {
        toast.error(`API Error: ${res.message.text}`)
      } else {
        queryClient.invalidateQueries(['files'])
        queryClient.invalidateQueries(['file', file.uid])
        handleClose()
        toast.success('Success: Editing file info')
      }
    },
    onError: e => {
      toast.error('Error: Editing file info')
    },
  })

  const onSubmit = (vals: any) => {
    editFileMutation.mutateAsync({
      name: vals.name,
      description: vals.description,
      fileId: file.uid,
    })
  }

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <label>File Name</label>
        <InputText
          label="File Name"
          {...register('name', { required: 'Name is required.' })}
          placeholder="Enter name..."
          disabled={isSubmitting}
        />
        <ErrorMessage
          errors={errors}
          name="name"
          render={({ message }) => <InputError>{message}</InputError>}
        />
      </FieldGroup>
      <FieldGroup>
        <label>Description</label>
        <InputText
          label="Description"
          {...register('description')}
          placeholder="Enter description..."
          disabled={isSubmitting}
        />
        <ErrorMessage
          errors={errors}
          name="description"
          render={({ message }) => <InputError>{message}</InputError>}
        />
      </FieldGroup>
      <ButtonRow>
        <Button type="button" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
        <ButtonSolidBlue type="submit" disabled={isSubmitting}>Edit</ButtonSolidBlue>
      </ButtonRow>
    </StyledForm>
  )
}

export const useEditFileModal = (selectedItem: IFile) => {
  const { isShown, setShowModal } = useModal()
  const selected = useMemo(() => selectedItem, [isShown])
  const handleClose = () => {
    setShowModal(false)
  }
  const modalComp = (
    <Modal
      data-testid="modal-files-edit"
      headerText="Edit file info"
      isShown={isShown}
      hide={handleClose}
    >
      <EditFileInfoForm file={selected} handleClose={handleClose} />
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
