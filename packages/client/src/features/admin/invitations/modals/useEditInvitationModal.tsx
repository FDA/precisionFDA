import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { Button } from '../../../../components/Button'
import { FieldGroup, InputError } from '../../../../components/form/styles'
import { InputText } from '../../../../components/InputText'
import { ModalHeaderTop, ModalNext } from '../../../modal/ModalNext'
import { ButtonRow, Footer, StyledForm, StyledModalScroll } from '../../../modal/styles'
import { useModal } from '../../../modal/useModal'
import { editInvitationBasicInfo, Invitation } from '../../users/api'
import { toastError, toastSuccess } from '../../../../components/NotificationCenter/ToastHelper'

const editInvitationSchema = Yup.object().shape({
  firstName: Yup.string().min(1).max(255).required(),
  lastName: Yup.string().min(1).max(255).required(),
  email: Yup.string().email().min(1).max(255).required(),
})

const EditInvitationInfoForm = ({ invitation, handleClose }: { invitation: Invitation; handleClose: () => void }) => {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(editInvitationSchema),
    defaultValues: {
      firstName: invitation?.firstName,
      lastName: invitation?.lastName,
      email: invitation?.email,
    },
  })

  const editInvitationMutation = useMutation({
    mutationKey: ['edit-invitation', invitation.id],
    mutationFn: (payload: { firstName: string; lastName: string; email: string }) =>
      editInvitationBasicInfo(invitation.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-invitations'],
      })
      handleClose()
      toastSuccess('Updated invitation information successfully')
    },
    onError: () => {
      toastError('Failed to update invitation information')
    },
  })

  const onSubmit = (vals: { firstName: string; lastName: string; email: string }) => {
    return editInvitationMutation.mutateAsync({
      firstName: vals.firstName,
      lastName: vals.lastName,
      email: vals.email,
    })
  }

  return (
    <>
      <StyledModalScroll>
        <StyledForm id="edit-invitation-form" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <label>First Name</label>
            <InputText
              {...register('firstName', { required: 'First Name is required.' })}
              placeholder="Enter first name..."
              disabled={isSubmitting}
            />
            <ErrorMessage errors={errors} name="firstName" render={({ message }) => <InputError>{message}</InputError>} />
          </FieldGroup>
          <FieldGroup>
            <label>Last Name</label>
            <InputText
              {...register('lastName', { required: 'Last Name is required.' })}
              placeholder="Enter last name..."
              disabled={isSubmitting}
            />
            <ErrorMessage errors={errors} name="lastName" render={({ message }) => <InputError>{message}</InputError>} />
          </FieldGroup>
          <FieldGroup>
            <label>Email</label>
            <InputText
              {...register('email', { required: 'Email is required.' })}
              placeholder="Enter email..."
              disabled={isSubmitting}
            />
            <ErrorMessage errors={errors} name="email" render={({ message }) => <InputError>{message}</InputError>} />
          </FieldGroup>
        </StyledForm>
      </StyledModalScroll>
      <Footer>
        <ButtonRow>
          <Button type="button" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button data-variant="primary" type="submit" form="edit-invitation-form" disabled={isSubmitting}>
            Edit
          </Button>
        </ButtonRow>
      </Footer>
    </>
  )
}

export const useEditInvitationModal = (selectedItem: Invitation) => {
  const { isShown, setShowModal } = useModal()
  const selected = useMemo(() => selectedItem, [isShown])
  const handleClose = () => {
    setShowModal(false)
  }
  const modalComp = (
    <ModalNext
      id="modal-invitation-edit"
      data-testid="modal-invitation-edit"
      headerText="Edit invitation info"
      isShown={isShown}
      hide={handleClose}
      variant="small"
    >
      <ModalHeaderTop headerText="Edit invitation info" hide={handleClose} />
      <EditInvitationInfoForm invitation={selected} handleClose={handleClose} />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
