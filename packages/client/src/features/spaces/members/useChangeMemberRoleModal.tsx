import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import { InputText } from '../../../components/InputText'
import { FieldGroup, Hint, InputError } from '../../../components/form/styles'
import { capitalize } from '../../../utils/formatting'
import { useAuthUser } from '../../auth/useAuthUser'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { useModal } from '../../modal/useModal'
import { changeMembershipRoleRequest } from './members.api'
import { MemberRole, SpaceMembership } from './members.types'
import { StyledFields, StyledFooter } from './members.styles'
import { Button } from '../../../components/Button'

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
    })
    .required('Required'),
})

export const useChangeMemberRoleModal = ({
  spaceId,
  member,
}: {
  spaceId: number
  member: SpaceMembership
}) => {
  const authUser = useAuthUser()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
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
      changeMembershipRoleRequest({
        spaceId,
        memberId: member.id,
        role: role.value,
      }),
    onSuccess: res => {
      if (authUser?.dxuser === res.member && res.role === 'disable') {
        navigate('/spaces')
        toast.success('Disabled yourself from the space')
      } else {
        reset()
        queryClient.invalidateQueries({
          queryKey: ['space-members'],
        })
        setShowModal(false)
        if (['enable', 'disable'].includes(res.role)) {
          toast.success(
            `${capitalize(res.role)}d member ${res.member} in the space`,
          )
        } else {
          toast.success(`Changed ${res.member} member role to ${res.role}`)
        }
      }
    },
    onError: e => {
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
  ].filter(r => member.to_roles.some(a => a === r.value))

  const modalComp = (
    <ModalNext
      id="add-resource-to-space"
      data-testid="modal-change-membership-role"
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText="Change member role"
        hide={() => setShowModal(false)}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <StyledFields>
          <FieldGroup>
            <label>Username</label>
            <InputText label="Username" value={member.user_name} disabled />
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
                  isLoading={mutation.isPending}
                  onBlur={onBlur}
                  value={value}
                  isDisabled={mutation.isPending}
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
        </StyledFields>
        <StyledFooter>
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
            aria-label="Change member role"
          >
            Change Role
          </Button>
        </StyledFooter>
      </form>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
  }
}
