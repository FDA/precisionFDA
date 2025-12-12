import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React from 'react'
import { useForm } from 'react-hook-form'
import { ApiErrorResponse } from '../../home/types'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { useModal } from '../../modal/useModal'
import { spaceGroupValidationSchema } from '../form/helpers'
import { ISpaceGroup, SpaceGroupFormData } from '../types'
import { updateSpaceGroupRequest } from '../api'
import { SpaceGroupForm } from '../form/SpaceGroupForm'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'

export const useEditSpaceGroupModal = ({ spaceGroup }: { spaceGroup: ISpaceGroup }) => {
  const queryClient = useQueryClient()
  const defaultValues = {
    name: spaceGroup.name,
    description: spaceGroup.description,
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
    mutationKey: ['update-space-group'],
    mutationFn: updateSpaceGroupRequest,
  })

  const handleClose = () => {
    setShowModal(false)
    reset(defaultValues)
  }

  const onSubmit = async (formData: SpaceGroupFormData) => {
    const payload = {
      id: spaceGroup.id,
      name: formData.name,
      description: formData.description,
    }

    try {
      await spaceGroupMutation.mutateAsync(payload)
      queryClient.invalidateQueries({
        queryKey: ['space-group-list'],
      })
      toastSuccess('Space Group updated')
    } catch (e: unknown) {
      const err = e as AxiosError<ApiErrorResponse>
      const message = err.response?.data?.error?.message || err.message || 'Unknown error'
      toastError(`Error while editing space group: ${message}`)
    }
    handleClose()
  }

  const { isShown, setShowModal } = useModal()

  const modalComp = (
    <ModalNext
      id="modal-space-group-edit"
      data-testid="modal-space-group-edit"
      isShown={Boolean(isShown)}
      hide={handleClose}
      variant="medium"
    >
      <ModalHeaderTop headerText={'Edit space group'} hide={handleClose} />
      <SpaceGroupForm
        action="edit"
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
    isShown,
  }
}
