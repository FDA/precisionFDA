import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { ErrorMessage } from '@hookform/error-message'
import { FieldGroup, InputError } from '../../../components/form/styles'
import { InputText, InputTextArea } from '../../../components/InputText'
import {
  ButtonRow,
  Footer,
  StyledForm,
  StyledModalScroll,
} from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { editFileRequest } from '../files.api'
import { IFile } from '../files.types'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { Button } from '../../../components/Button'

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
  } = useForm({
    defaultValues: {
      name: file?.name,
      description: file?.description,
    },
  })

  const editFileMutation = useMutation({
    mutationKey: ['edit-file'],
    mutationFn: (payload: {
      name: string
      description: string
      fileId: string
    }) => editFileRequest(payload),
    onSuccess: res => {
      if (res?.message?.type === 'error') {
        toast.error(`API Error: ${res.message.text}`)
      } else {
        queryClient.invalidateQueries({
          queryKey: ['files'],
        })
        queryClient.invalidateQueries({
          queryKey: ['file', file.uid],
        })
        handleClose()
        toast.success('Success: Editing file info')
      }
    },
    onError: e => {
      toast.error('Error: Editing file info')
    },
  })

  const onSubmit = (vals: {name: string, description: string | null}) => {
    return editFileMutation.mutateAsync({
      name: vals.name,
      description: vals.description ?? '',
      fileId: file.uid,
    })
  }

  return (
    <>
      <StyledModalScroll>
        <StyledForm id="edit-file-form" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <label>File Name</label>
            <InputText
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
            <InputTextArea
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
        </StyledForm>
      </StyledModalScroll>
      <Footer>
        <ButtonRow>
          <Button type="button" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button data-variant="primary" type="submit" form="edit-file-form" disabled={isSubmitting}>
            Edit
          </Button>
        </ButtonRow>
      </Footer>
    </>
  )
}

export const useEditFileModal = (selectedItem: IFile) => {
  const { isShown, setShowModal } = useModal()
  const selected = useMemo(() => selectedItem, [isShown])
  const handleClose = () => {
    setShowModal(false)
  }
  const modalComp = (
    <ModalNext
      id="modal-files-edit"
      data-testid="modal-files-edit"
      headerText="Edit file info"
      isShown={isShown}
      hide={handleClose}
      variant='medium'
    >
      <ModalHeaderTop headerText="Edit file info" hide={handleClose} />
      <EditFileInfoForm file={selected} handleClose={handleClose} />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
