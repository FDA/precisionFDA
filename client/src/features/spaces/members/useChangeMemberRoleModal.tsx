import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useHistory } from 'react-router'
import Select from 'react-select'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import { Button, ButtonSolidBlue } from '../../../components/Button'
import { FieldGroup, Hint, InputError } from '../../../components/form/styles'
import { InputText } from '../../../components/InputText'
import { capitalize } from '../../../utils/formatting'
import { useAuthUser } from '../../auth/useAuthUser'
import { Modal } from '../../modal'
import { ButtonRow, StyledForm } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { changeMembershipRoleRequest } from './members.api'
import { MemberRole, SpaceMembership } from './members.types'


interface FormValues {
  role: { label: string; value: MemberRole }
}

const LABEL: Record<MemberRole, string> = {
  admin: 'Admin',
  contributor: 'Contributor',
  viewer: 'Viewer',
  lead: 'Lead',
  disable: 'Disable',
  enable: 'Enable',
}

const validationSchema = Yup.object().shape({
  role: Yup.object()
    .shape({
      value: Yup.string().required('Role required'),
    }).required('Required'),
})

export const useChangeMemberRoleModal = ({ spaceId, member }: { spaceId: string, member: SpaceMembership }) => {
  const authUser = useAuthUser()
  const queryClient = useQueryClient()
  const history = useHistory()
  const { isShown, setShowModal } = useModal()
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
  })
  const mutation = useMutation({
    mutationKey: ['change-membership-role'],
    mutationFn: ({ role }: FormValues) =>
      changeMembershipRoleRequest({ spaceId, memberId: member.id, role: role.value }),
    onSuccess: res => {
      if (authUser.dxuser === res.member && res.role === 'disable') {
        history.push('/spaces')
        toast.success('Disabled yourself from the space.')
      } else {
        reset()
        queryClient.invalidateQueries(['space-members'])
        setShowModal(false)
        if (['enable','disable'].includes(res.role)){
          toast.success(`${capitalize(res.role)}d member ${res.member} in the space.`)
        } else {
          toast.success(`Changed ${res.member} member role to ${res.role}.`)
        }
      }
    },
    onError: (e) => {
      toast.error(`Error: Change member role. ${e.response.data.errors}`)
    },
  })

  const onSubmit = ({ role }: FormValues) => {
    mutation.mutateAsync({ role })
  }

  const roleOptions = [
    { value: 'admin', label: LABEL['admin'] },
    { value: 'contributor', label: LABEL['contributor'] },
    { value: 'viewer', label: LABEL['viewer'] },
    { value: 'lead', label: LABEL['lead'] },
    { value: 'disable', label: LABEL['disable'] },
    { value: 'enable', label: LABEL['enable'] },
  ].filter(r => member.to_roles.some((a) => a === r.value))

  const modalComp = (
    <Modal
      data-testid="modal-add-members"
      headerText="Change member role"
      isShown={isShown}
      hide={() => {
        reset()
        setShowModal(false)
      }}
      overflowContent={false}
    >
      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <label>Username</label>
          <InputText
            label="Username"
            value={member.user_name}
            disabled
          />
        </FieldGroup>
        <FieldGroup>
          <label>Current role</label>
          <InputText
            label="Current Role"
            value={member.active ? member.role : `${member.role} (disabled)`}
            disabled
          />
        </FieldGroup>
        <FieldGroup>
          <label>Change to role</label>
          <Controller
            name="role"
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                options={roleOptions}
                onChange={onChange}
                isLoading={mutation.isLoading}
                onBlur={onBlur}
                value={value}
                isDisabled={mutation.isLoading}
                defaultInputValue={undefined}
              />
            )}
          />
          <Hint>Select the members role</Hint>
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
            Change Role
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
