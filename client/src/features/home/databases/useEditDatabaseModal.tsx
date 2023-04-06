import { ErrorMessage } from '@hookform/error-message'
import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Button, ButtonSolidBlue } from '../../../components/Button'
import { FieldGroup, InputError } from '../../../components/form/styles'
import { InputText } from '../../../components/InputText'
import { ButtonRow, Footer, ModalScroll, StyledForm } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { editDatabaseRequest } from './databases.api'
import { IDatabase } from './databases.types'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'

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
    mutationKey: ['edit-database'],
    mutationFn: (payload: { name: string; description: string }) =>
      editDatabaseRequest(payload, db.dxid),
    onSuccess: res => {
      queryClient.invalidateQueries(['dbcluster', db.dxid])
      queryClient.invalidateQueries(['dbclusters'])
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
    <>
      <ModalScroll>
        <StyledForm id="edit-database-form" onSubmit={handleSubmit(onSubmit)}>
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
        </StyledForm>
      </ModalScroll>
      <Footer>
        <ButtonRow>
          <Button type="button" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <ButtonSolidBlue
            type="submit"
            form="edit-database-form"
            disabled={isSubmitting}
          >
            Edit
          </ButtonSolidBlue>
        </ButtonRow>
      </Footer>
    </>
  )
}

export const useEditDatabaseModal = (selectedItem: IDatabase) => {
  const { isShown, setShowModal } = useModal()
  const selected = useMemo(() => selectedItem, [isShown])
  const handleClose = () => {
    setShowModal(false)
  }
  const modalComp = isShown && (
    <ModalNext
      data-testid="modal-dbclusters-edit"
      isShown={isShown}
      hide={handleClose}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText="Edit database info"
        hide={() => setShowModal(false)}
      />
      <EditDatabaseInfoForm db={selected} handleClose={handleClose} />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
