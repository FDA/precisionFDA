import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import Select from 'react-select'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import { Button, ButtonSolidBlue } from '../../../components/Button'
import { FieldGroup, InputError, Hint } from '../../../components/form/styles'
import { InputText } from '../../../components/InputText'
import { Modal } from '../../modal'
import { ButtonRow, StyledForm } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { addMembersToSpaceRequest } from './members.api'
import { MemberRole } from './members.types'

interface FormValues {
  invitees_role: { label: string; value: MemberRole }
  invitees: string
}

const validationSchema = Yup.object().shape({
  invitees: Yup.string().required('Username(s) required'),
  invitees_role: Yup.object()
    .shape({
      value: Yup.string().required('Role required'),
    }).required('Required'),
})

export const useAddMembersModal = ({ spaceId }: { spaceId: string }) => {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useModal()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: { invitees: '', invitees_role: { value: 'admin', label: 'Admin' }},
    resolver: yupResolver(validationSchema),
  })
  const mutation = useMutation({
    mutationFn: ({ invitees, invitees_role }: FormValues) =>
      addMembersToSpaceRequest({ spaceId, invitees, invitees_role: invitees_role.value }),
    onSuccess: res => {
      reset()
      queryClient.invalidateQueries('space-members')
      setShowModal(false)
      toast.success('Success: Adding members.')
    },
    onError: (e: any) => {
      toast.error(`Error: Adding members. ${e.response.data.errors}`)
    },
  })

  const onSubmit = ({ invitees_role, invitees }: FormValues) => {
    mutation.mutateAsync({ invitees, invitees_role })
  }

  const modalComp = (
    <Modal
      data-testid="modal-add-members"
      headerText="Add members to space"
      isShown={isShown}
      hide={() => {
        reset()
        setShowModal(false)
      }}
      overflowContent={false}
    >
      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <label>Username List</label>
          <InputText
            label="Username List"
            {...register('invitees')}
            placeholder=""
            autoFocus
            disabled={mutation.isLoading}
          />
          <Hint>
            Enter usernames or emails seperated by commas. For example:
            first_user, second_user, third_user@email.com
          </Hint>
          <ErrorMessage
            errors={errors}
            name="invitees"
            render={({ message }) => <InputError>{message}</InputError>}
          />
        </FieldGroup>
        <FieldGroup>
          <label>Role</label>
          <Controller
            name="invitees_role"
            control={control}
            render={({ field: { value, onChange, onBlur }}) => (
              <Select
                options={[
                  { value: 'admin', label: 'Admin' },
                  { value: 'contributor', label: 'Contributor' },
                  { value: 'viewer', label: 'Viewer' },
                ]}
                onChange={onChange}
                isLoading={mutation.isLoading}
                onBlur={onBlur}
                value={value}
                isDisabled={mutation.isLoading}
              />
            )}
          />
          <Hint>Select the new members role</Hint>
          <ErrorMessage
            errors={errors}
            name="name"
            render={({ message }) => <InputError>{message}</InputError>}
          />
        </FieldGroup>
        <ButtonRow>
          <Button
            type="button"
            onClick={() => {
              reset()
              setShowModal(false)
            }}
            disabled={mutation.isLoading}
            aria-label="Close modal"
          >
            Cancel
          </Button>
          <ButtonSolidBlue
            type="submit"
            disabled={Object.keys(errors).length > 0 || mutation.isLoading}
            aria-label="Submit add members"
          >
            Add Members
          </ButtonSolidBlue>
        </ButtonRow>
      </StyledForm>
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
  }
}
