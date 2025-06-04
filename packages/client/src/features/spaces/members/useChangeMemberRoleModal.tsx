import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import { Button } from '../../../components/Button'
import { Callout } from '../../../components/Callout'
import { InputText } from '../../../components/InputText'
import { FieldGroup, Hint, InputError } from '../../../components/form/styles'
import { capitalize } from '../../../utils/formatting'
import { useAuthUser } from '../../auth/useAuthUser'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { useModal } from '../../modal/useModal'
import { changeMembershipRoleRequest } from './members.api'
import { StyledFields, StyledFooter } from './members.styles'
import { MemberRole, SpaceMembership } from './members.types'
import { Select } from '../../../components/Select'

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

type ErrorResponse = { response?: { data?: { errors?: string } } }
interface ChangeMemberRoleFormProps {
  spaceId: number
  member: SpaceMembership
  onClose: () => void
}

const ChangeMemberRoleForm: React.FC<ChangeMemberRoleFormProps> = ({ spaceId, member, onClose }) => {
  const authUser = useAuthUser()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormValues>({ resolver: yupResolver(validationSchema) })
  const isLeadSelected = watch('role')?.value === 'lead'
  const mutation = useMutation({
    mutationFn: ({ role }: FormValues) => changeMembershipRoleRequest({ spaceId, memberId: member.id, role: role.value }),
    onSuccess: res => {
      if (authUser?.dxuser === res.member && res.role === 'disable') {
        navigate('/spaces')
        toast.success('Disabled yourself from the space')
      } else {
        reset()
        queryClient.invalidateQueries({ queryKey: ['space-members']})
        onClose()
        const msg = ['enable', 'disable'].includes(res.role)
          ? `${capitalize(res.role)}d member ${res.member} in the space`
          : `Changed ${res.member} member role to ${res.role}`
        toast.success(msg)
      }
    },
    onError: (error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as ErrorResponse
        toast.error(`Change member role. ${err.response?.data?.errors || 'Unknown error'}`)
      } else {
        toast.error('Change member role. Unknown error')
      }
    },
  })
  const roleOptions = [
    { value: 'admin' as MemberRole, label: LABEL.admin },
    { value: 'contributor' as MemberRole, label: LABEL.contributor },
    { value: 'viewer' as MemberRole, label: LABEL.viewer },
    { value: 'lead' as MemberRole, label: LABEL.lead },
    { value: 'disable' as MemberRole, label: LABEL.disable },
    { value: 'enable' as MemberRole, label: LABEL.enable },
  ].filter(r => member.to_roles.includes(r.value))
  const onSubmit = (data: FormValues) => mutation.mutate(data)
  const onCancel = () => {
    reset()
    onClose()
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StyledFields>
        <FieldGroup>
          <label>Username</label>
          <InputText value={member.user_name} disabled />
        </FieldGroup>
        <FieldGroup>
          <label>Current role</label>
          <InputText value={member.active ? member.role : `${member.role} (disabled)`} disabled />
        </FieldGroup>
        <FieldGroup>
          <label>Change to role</label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                options={roleOptions}
                {...field}
                isLoading={mutation.isPending}
                isDisabled={mutation.isPending}
                inputId="select_member_role"
              />
            )}
          />
          <Hint>Select the members role</Hint>
          <ErrorMessage errors={errors} name="role" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
        {isLeadSelected && (
          <Callout data-variant="warning">
            Changing this user to Lead role will make you admin in this space. The new Lead will assume billing for this Space,
            including storage costs for files and run costs for App Executions.
          </Callout>
        )}
      </StyledFields>
      <StyledFooter>
        <Button type="button" onClick={onCancel} disabled={mutation.isPending} aria-label="Close modal">
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
  )
}

export const useChangeMemberRoleModal = ({ spaceId, member }: { spaceId: number; member: SpaceMembership }) => {
  const { isShown, setShowModal } = useModal()
  const modalComp = isShown && (
    <ModalNext
      id="add-resource-to-space"
      data-testid="modal-change-membership-role"
      isShown={isShown}
      hide={() => setShowModal(false)}
      variant="medium"
    >
      <ModalHeaderTop disableClose={false} headerText="Change member role" hide={() => setShowModal(false)} />
      <ChangeMemberRoleForm spaceId={spaceId} member={member} onClose={() => setShowModal(false)} />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
