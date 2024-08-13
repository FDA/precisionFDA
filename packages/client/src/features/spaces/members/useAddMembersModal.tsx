import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import { InputText } from '../../../components/InputText'
import { FieldGroup, Hint, InputError } from '../../../components/form/styles'
import { ButtonRow } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { addMembersToSpaceRequest } from './members.api'
import { MemberRole } from './members.types'
import { StyledFields, StyledFooter } from './members.styles'
import { Select } from '../../../components/Select'
import { Button } from '../../../components/Button'
import { ModalNext, ModalHeaderTop } from '../../modal/ModalNext'

interface FormValues {
  invitees_role: { label: string; value: MemberRole }
  invitees: string
}

const validationSchema = Yup.object().shape({
  invitees: Yup.string().required('Username(s) required'),
  invitees_role: Yup.object()
    .shape({
      value: Yup.string().required('Role required'),
    })
    .required('Required'),
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
    defaultValues: {
      invitees: '',
      invitees_role: { value: 'viewer', label: 'Viewer' },
    },
    resolver: yupResolver(validationSchema),
  })
  const mutation = useMutation({
    mutationKey: ['add-members-to-space'],
    mutationFn: ({ invitees, invitees_role }: FormValues) =>
      addMembersToSpaceRequest({
        spaceId,
        invitees: invitees.toLowerCase(),
        invitees_role: invitees_role.value,
      }),
    onSuccess: res => {
      reset()
      queryClient.invalidateQueries({
        queryKey: ['space-members'],
      })
      queryClient.invalidateQueries({
        queryKey: ['space', spaceId.toString()],
      })
      setShowModal(false)
      toast.success('Success: Adding members')
    },
    onError: (e: any) => {
      toast.error(`Error: Adding members. ${e.response.data.errors}`)
    },
  })

  const onSubmit = ({ invitees_role, invitees }: FormValues) => {
    mutation.mutateAsync({ invitees, invitees_role })
  }

  const modalComp = (
    <ModalNext
      id="modal-add-members"
      data-testid="modal-add-members"
      isShown={isShown}
      hide={() => setShowModal(false)}
      variant="medium"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeaderTop
          disableClose={false}
          headerText="Add members to space"
          hide={() => {
            setShowModal(false)
          }}
        />
        <StyledFields>

        <FieldGroup>
          <label>Username List</label>
          <InputText
            label="Username List"
            {...register('invitees')}
            placeholder=""
            autoFocus
            disabled={mutation.isPending}
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
                isLoading={mutation.isPending}
                onBlur={onBlur}
                value={value}
                isDisabled={mutation.isPending}
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
        </StyledFields>
        <StyledFooter>
          <ButtonRow>
            <Button
              type="button"
              onClick={() => {
                reset()
                setShowModal(false)
              }}
              disabled={mutation.isPending}
              aria-label="Close modal"
            >
              Cancel
            </Button>
            <Button
              data-variant="primary"
              type="submit"
              disabled={Object.keys(errors).length > 0 || mutation.isPending}
              aria-label="Submit add members"
            >
              Add Members
            </Button>
          </ButtonRow>
        </StyledFooter>
      </form>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
  }
}
