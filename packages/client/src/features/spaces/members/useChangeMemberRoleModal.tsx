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
import { ErrorHint, FieldGroup, Hint, InputError } from '../../../components/form/styles'
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
  spaceId: string | number
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

  const disableMutation = useMutation({
    mutationFn: (action: 'disable' | 'enable') => changeMembershipRoleRequest({ spaceId, memberId: member.id, role: action }),
    onSuccess: res => {
      if (authUser?.dxuser === res.member && res.role === 'disable') {
        navigate('/spaces')
        toast.success('Disabled yourself from the space')
      } else {
        reset()
        queryClient.invalidateQueries({ queryKey: ['space-members']})
        onClose()
        const msg = `${capitalize(res.role)}d member ${res.member} in the space`
        toast.success(msg)
      }
    },
  })

  const roleOptions = [
    { value: 'admin' as MemberRole, label: LABEL.admin },
    { value: 'contributor' as MemberRole, label: LABEL.contributor },
    { value: 'viewer' as MemberRole, label: LABEL.viewer },
    { value: 'lead' as MemberRole, label: LABEL.lead },
  ].filter(r => member.to_roles.includes(r.value))

  const onSubmit = (data: FormValues) => mutation.mutate(data)
  const onCancel = () => {
    reset()
    onClose()
  }

  const onDisableToggle = () => {
    const action = member.active === 'Active' ? 'disable' : 'enable'
    disableMutation.mutate(action)
  }

  const canDisableOrEnable = member.to_roles.includes('disable') || member.to_roles.includes('enable')
  const isSubmitting = mutation.isPending || disableMutation.isPending
  const isMemberDisabled = member.active === 'Inactive' || member.active === 'Account deactivated'
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StyledFields>
        <FieldGroup>
          <label>Username</label>
          <InputText value={member.user_name} disabled />
        </FieldGroup>
        <FieldGroup>
          <label>Current role</label>
          <InputText value={isMemberDisabled ? `${member.role} (disabled)` : member.role} disabled />
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
                isLoading={isSubmitting}
                isDisabled={isSubmitting || isMemberDisabled}
                inputId="select_member_role"
              />
            )}
          />
          <Hint>
            {member.active === 'Active' && 'Select the members role.'}
          </Hint>
          <ErrorHint>
            {member.active === 'Inactive' && 'Enable the member first to change their role.'}
            {member.active === 'Account deactivated' && 'Account is deactivated in precisionFDA and cannot be modified. An admin must reactivate the account first.'}
          </ErrorHint>
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
        <div>

          {canDisableOrEnable && (
            <Button
              type="button"
              onClick={onDisableToggle}
              disabled={isSubmitting || member.active === 'Account deactivated'}
              data-variant={member.active === 'Active' ? 'warning' : 'success'}
              aria-label={member.active === 'Active' ? 'Disable member' : 'Enable member'}
            >
              {!isMemberDisabled ? 'Disable Member' : 'Enable Member'}
            </Button>
          )}
        </div>
        <div className='flex align-center gap-2'>
          <Button type="button" onClick={onCancel} disabled={isSubmitting} aria-label="Close modal">
            Cancel
          </Button>
          <Button
            data-variant="primary"
            type="submit"
            disabled={Object.keys(errors).length > 0 || isSubmitting || isMemberDisabled}
            aria-label="Change member role"
          >
            Change Role
          </Button>
        </div>
      </StyledFooter>
    </form>
  )
}

export const useChangeMemberRoleModal = ({ spaceId, member }: { spaceId: string | number; member: SpaceMembership }) => {
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
