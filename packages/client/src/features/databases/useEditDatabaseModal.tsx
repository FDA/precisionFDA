import { ErrorMessage } from '@hookform/error-message'
import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FieldGroup, InputError } from '../../components/form/styles'
import { InputText } from '../../components/InputText'
import { ButtonRow, Footer, ModalScroll, StyledForm } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { EditDatabasePayload, editDatabaseRequest } from './databases.api'
import { IDatabase } from './databases.types'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { Button } from '../../components/Button'
import { ApiErrorResponse } from '../home/types'
import { toastError, toastSuccess } from '../../components/NotificationCenter/ToastHelper'

const EditDatabaseInfoForm = ({ db, handleClose }: { db: IDatabase; handleClose: () => void }) => {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: db?.name,
      description: db?.description,
    },
  })

  const editDbClusterMutation = useMutation({
    mutationKey: ['edit-database'],
    mutationFn: (payload: EditDatabasePayload) => editDatabaseRequest(payload, db.uid),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dbcluster', db.uid],
      })
      queryClient.invalidateQueries({
        queryKey: ['dbclusters'],
      })
      handleClose()
      toastSuccess('Success: Editing database info')
    },
    onError: (error: unknown) => {
      const err = error as ApiErrorResponse
      toastError(`Error: ${err?.error?.message}`)
    },
  })

  const onSubmit = (vals: EditDatabasePayload) => {
    editDbClusterMutation.mutateAsync({
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
              {...register('name', { required: 'Name is required.' })}
              placeholder="Enter name..."
              disabled={isSubmitting}
            />
            <ErrorMessage errors={errors} name="name" render={({ message }) => <InputError>{message}</InputError>} />
          </FieldGroup>
          <FieldGroup>
            <label>Description</label>
            <InputText {...register('description')} placeholder="Enter description..." disabled={isSubmitting} />
            <ErrorMessage errors={errors} name="description" render={({ message }) => <InputError>{message}</InputError>} />
          </FieldGroup>
        </StyledForm>
      </ModalScroll>
      <Footer>
        <ButtonRow>
          <Button type="button" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button data-variant="primary" type="submit" form="edit-database-form" disabled={isSubmitting}>
            Edit
          </Button>
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
  const modalComp = (
    <ModalNext id="modal-dbclusters-edit" data-testid="modal-dbclusters-edit" isShown={isShown} hide={handleClose}>
      <ModalHeaderTop disableClose={false} headerText="Edit database info" hide={() => setShowModal(false)} />
      <EditDatabaseInfoForm db={selected} handleClose={handleClose} />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
