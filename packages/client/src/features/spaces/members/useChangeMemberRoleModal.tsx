import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { Button } from '../../../components/Button'
import { Callout } from '../../../components/Callout'
import { InputText } from '../../../components/InputText'
import { Select } from '../../../components/Select'
import { ErrorHint, FieldGroup, Hint, InputError } from '../../../components/form/styles'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { useModal } from '../../modal/useModal'
import { StyledFields, StyledFooter } from './members.styles'
import { MemberRole, SpaceMembership, UpdateRolesFormValues } from './members.types'
import { useUpdateMemberRolesMutation } from './useUpdateMemberRolesMutation'

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
      label: Yup.string().required('Role label required'),
      value: Yup.string()
        .oneOf([...Object.keys(LABEL)] as MemberRole[])
        .required('Role value required'),
    })
    .required('Required'),
})

interface ChangeMemberRoleFormProps {
  spaceId: number
  member: SpaceMembership
  onClose: () => void
}

const ChangeMemberRoleForm: React.FC<ChangeMemberRoleFormProps> = ({ spaceId, member, onClose }) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<UpdateRolesFormValues>({ resolver: yupResolver(validationSchema) })
  const isLeadSelected = watch('role')?.value === 'lead'
  const onMutationSuccess = () => {
    reset()
    onClose()
  }
  const mutation = useUpdateMemberRolesMutation(spaceId, [member], onMutationSuccess)

  const roleOptions = [
    { value: 'admin' as MemberRole, label: LABEL.admin },
    { value: 'contributor' as MemberRole, label: LABEL.contributor },
    { value: 'viewer' as MemberRole, label: LABEL.viewer },
    { value: 'lead' as MemberRole, label: LABEL.lead },
  ].filter(r => member.to_roles.includes(r.value))

  const onSubmit = (data: UpdateRolesFormValues) => mutation.mutate(data)
  const onCancel = () => {
    reset()
    onClose()
  }

  const onDisableToggle = () => {
    const action = member.active === 'Active' ? 'disable' : ('enable' as MemberRole)
    mutation.mutate({ role: { label: LABEL[action], value: action } })
  }

  const canDisableOrEnable = member.to_roles.includes('disable') || member.to_roles.includes('enable')
  const isSubmitting = mutation.isPending
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
          <Hint>{member.active === 'Active' && 'Select the members role.'}</Hint>
          <ErrorHint>
            {member.active === 'Inactive' && 'Enable the member first to change their role.'}
            {member.active === 'Account deactivated' &&
              'Account is deactivated in precisionFDA and cannot be modified. An admin must reactivate the account first.'}
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
        <div className="flex items-center gap-2">
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
