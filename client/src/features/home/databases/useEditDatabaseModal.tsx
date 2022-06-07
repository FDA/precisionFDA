import { ErrorMessage } from '@hookform/error-message'
import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { Button, ButtonSolidBlue } from '../../../components/Button'
import { FieldGroup, InputError } from '../../../components/form/styles'
import { InputText } from '../../../components/InputText'
import { Modal } from '../../modal'
import { ButtonRow, StyledForm } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { editDatabaseRequest } from './databases.api'
import { IDatabase } from './databases.types'

const EditDatabaseInfoForm = ({
  db,
  handleClose,
}: {
  db: IDatabase
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
      name: db?.name,
      description: db?.description,
    },
  })

  const editFileMutation = useMutation({
    mutationFn: (payload: {
      name: string
      description: string
    }) => editDatabaseRequest(payload, db.dxid),
    onSuccess: res => {
      queryClient.invalidateQueries(['dbcluster', db.dxid])
      queryClient.invalidateQueries('dbclusters')
      handleClose()
      toast.success('Success: Editing database info')
    },
    onError: e => {
      toast.error('Error: Editing database info')
    },
  })

  const onSubmit = (vals: any) => {
    editFileMutation.mutateAsync({
      name: vals.name,
      description: vals.description,
    })
  }

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <label>Database Name</label>
        <InputText
          label="Database Name"
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

export const useEditDatabaseModal = (selectedItem: IDatabase) => {
  const { isShown, setShowModal } = useModal()
  const selected = useMemo(() => selectedItem, [isShown])
  const handleClose = () => {
    setShowModal(false)
  }
  const modalComp = (
    <Modal
      data-testid="modal-dbclusters-edit"
      headerText="Edit database info"
      isShown={isShown}
      hide={handleClose}
    >
      <EditDatabaseInfoForm db={selected} handleClose={handleClose} />
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
