import { ErrorMessage } from '@hookform/error-message'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Button, ButtonSolidBlue } from '../../../../components/Button'
import { FieldGroup, InputError } from '../../../../components/form/styles'
import { InputText } from '../../../../components/InputText'
import { ButtonRow, Footer, ModalScroll, StyledForm } from '../../../modal/styles'
import { useConditionalModal } from '../../../modal/useModal'
import { ResourceScope } from '../../types'
import { addFolderRequest } from '../files.api'
import { ModalHeaderTop, ModalNext } from '../../../modal/ModalNext'

type FolderModalArgs = {
  folderId?: string
  spaceId?: string
  scope?: ResourceScope
  isAllowed: boolean
  onViolation: () => void
}

export const useAddFolderModal = ({
  folderId,
  spaceId,
  scope,
  isAllowed,
  onViolation,
}: FolderModalArgs) => {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useConditionalModal(isAllowed, onViolation)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
  } = useForm({ defaultValues: { name: '' } })
  const mutation = useMutation({
    mutationKey: ['add-folder'],
    mutationFn: (payload: { name: string }) =>
      addFolderRequest(payload, folderId, spaceId, scope),
    onSuccess: res => {
      if (res?.message?.type === 'error') {
        const errorMessage = res.message?.text ?? 'Unknown error adding folder'
        setError('name', { message: errorMessage, type: 'validate' })
        toast.error(errorMessage)
        return
      }
      reset()
      queryClient.invalidateQueries(['files'])
      setShowModal(false)
      toast.success('Success: Adding folder.')
    },
    onError: () => {
      toast.error('Error: Adding folder.')
    },
  })

  const onSubmit = (vals: any) => {
    mutation.mutateAsync({ name: vals.name })
  }

  const modalComp = (
    <ModalNext
      data-testid="modal-files-add-folder"
      isShown={Boolean(isShown)}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        headerText="Create new folder"
        hide={() => setShowModal(false)}
      />
      <ModalScroll>
        <StyledForm id="add-folder-form" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <label>Folder Name</label>
            <InputText
              label="Folder Name"
              {...register('name')}
              placeholder="Enter Name..."
              autoFocus
              disabled={mutation.isLoading}
            />
            <ErrorMessage
              errors={errors}
              name="name"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </FieldGroup>
        </StyledForm>
      </ModalScroll>
      <Footer>
        <ButtonRow>
          <Button
            type="button"
            onClick={() => setShowModal(false)}
            disabled={mutation.isLoading}
          >
            Cancel
          </Button>
          <ButtonSolidBlue
            type="submit"
            form="add-folder-form"
            disabled={mutation.isLoading}
          >
            Add
          </ButtonSolidBlue>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
  }
}
