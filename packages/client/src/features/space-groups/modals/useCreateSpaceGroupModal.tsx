import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React from 'react'
import { useForm } from 'react-hook-form'
import { ApiErrorResponse } from '../../home/types'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { useModal } from '../../modal/useModal'
import { spaceGroupValidationSchema } from '../form/helpers'
import { SpaceGroupFormData } from '../types'
import { createSpaceGroupRequest } from '../api'
import { SpaceGroupForm } from '../form/SpaceGroupForm'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'

export const useCreateSpaceGroupModal = () => {
  const queryClient = useQueryClient()
  const defaultValues = {
    name: '',
    description: '',
  }
  const {
    reset,
    formState: { isSubmitting },
  } = useForm<SpaceGroupFormData>({
    mode: 'onBlur',
    resolver: yupResolver(spaceGroupValidationSchema),
    defaultValues: {
      ...defaultValues,
    },
  })

  const spaceGroupMutation = useMutation({
    mutationKey: ['create-space-group'],
    mutationFn: createSpaceGroupRequest,
  })

  const handleClose = () => {
    setShowModal(false)
    reset(defaultValues)
  }

  const onSubmit = async (formData: SpaceGroupFormData) => {
    const payload = {
      name: formData.name,
      description: formData.description,
    }

    try {
      await spaceGroupMutation.mutateAsync(payload)
      queryClient.invalidateQueries({
        queryKey: ['space-group-list'],
      })
      toastSuccess('Space Group created')
    } catch (e: unknown) {
      const err = e as AxiosError<ApiErrorResponse>
      const message = err.response?.data?.error?.message || err.message || 'Unknown error'
      toastError(`Error while creating Space Group: ${message}`)
    }
    handleClose()
  }

  const { isShown, setShowModal } = useModal()

  const modalComp = (
    <ModalNext
      id="modal-space-group-create"
      data-testid="modal-space-group-create"
      isShown={Boolean(isShown)}
      hide={handleClose}
      variant="medium"
    >
      <ModalHeaderTop headerText={'Create a new space group'} hide={handleClose} />
      <SpaceGroupForm
        action="create"
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        setShowModal={setShowModal}
      />
    </ModalNext>
  )

  return {
    modalComp,
    setShowModal,
  }
}
