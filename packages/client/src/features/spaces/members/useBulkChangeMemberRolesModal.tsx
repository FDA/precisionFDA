import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import type React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Tooltip } from 'react-tooltip'
import * as Yup from 'yup'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/utils/cn'
import { Button } from '../../../components/Button'
import { ErrorHint, FieldGroup, Hint, InputError } from '../../../components/form/form.styles'
import { ModalHeaderTop, ModalNext, useModalFloatingPortalHost } from '../../modal/ModalNext'
import { useModal } from '../../modal/useModal'
import {
  MemberItem,
  MemberItemHeader,
  MemberItemsWrapper,
  MemberTable,
  StatusPill,
  StyledFields,
  StyledFooter,
} from './members.styles'
import type { MemberRole, SpaceMembership } from './members.types'
import { useUpdateMemberRolesMutation } from './useUpdateMemberRolesMutation'

type BulkChangeSupportedRoles = Exclude<MemberRole, 'lead'>

interface BulkUpdateRolesFormValues {
  role: { label: string; value: BulkChangeSupportedRoles }
}

const LABEL: Record<BulkChangeSupportedRoles, string> = {
  admin: 'Admin',
  contributor: 'Contributor',
  viewer: 'Viewer',
  disable: 'Disable',
  enable: 'Enable',
}

const validationSchema = Yup.object().shape({
  role: Yup.object()
    .shape({
      label: Yup.string().required('Role label required'),
      value: Yup.string()
        .oneOf([...Object.keys(LABEL)] as BulkChangeSupportedRoles[])
        .required('Role value required'),
    })
    .required('Role required'),
})

interface ChangeBulkMemberRolesFormProps {
  spaceId: number
  members: SpaceMembership[]
  onClose: () => void
}

const BulkChangeMemberRolesForm: React.FC<ChangeBulkMemberRolesFormProps> = ({ spaceId, members, onClose }) => {
  const floatingPortalHost = useModalFloatingPortalHost()
  const changeableMembers = members.filter(m => m.active !== 'Account deactivated' && m.role !== 'lead')
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<BulkUpdateRolesFormValues>({ resolver: yupResolver(validationSchema) })

  const onMutationSuccess = () => {
    reset()
    onClose()
  }

  const mutation = useUpdateMemberRolesMutation(spaceId, changeableMembers, onMutationSuccess)

  const selectedRole = watch('role')
  const hasLeadMembers = members.some(member => member.role === 'lead')
  const hasAccountDeactivatedMembers = members.some(member => member.active === 'Account deactivated')
  const hasInactiveMembers = changeableMembers.some(member => member.active === 'Inactive')
  const hasActiveMembers = changeableMembers.some(member => member.active === 'Active')
  const tooltipMsg = hasInactiveMembers
    ? 'Cannot change roles while there are inactive members in the selection. Please enable all members first.'
    : ''

  const roleOptions: { value: BulkChangeSupportedRoles; label: string }[] = [
    { value: 'admin', label: LABEL.admin },
    { value: 'contributor', label: LABEL.contributor },
    { value: 'viewer', label: LABEL.viewer },
  ]
  const onSubmit = (data: BulkUpdateRolesFormValues) => {
    mutation.mutateAsync(data)
  }

  const onToggleMemberships = (status: 'enable' | 'disable') => {
    mutation.mutateAsync({ role: { label: LABEL[status], value: status } })
  }

  const onCancel = () => {
    reset()
    onClose()
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StyledFields>
        <FieldGroup>
          <label htmlFor="select_member_role">Change to role</label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => {
              const disabled = mutation.isPending || hasInactiveMembers || changeableMembers.length === 0
              return (
                <Select
                  id="select_member_role"
                  name={String(field.name)}
                  modal={false}
                  items={roleOptions}
                  value={field.value?.value ?? null}
                  onOpenChange={open => {
                    if (!open) field.onBlur()
                  }}
                  onValueChange={v => {
                    const chosen = roleOptions.find(o => o.value === v)
                    field.onChange(chosen ?? null)
                  }}
                  disabled={disabled}
                >
                  <SelectTrigger
                    className={cn('w-full min-w-0 justify-between')}
                    ref={field.ref}
                    aria-invalid={errors.role ? true : undefined}
                  >
                    <SelectValue placeholder="Choose…" />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="start" container={floatingPortalHost ?? undefined}>
                    {roleOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            }}
          />
          <Hint>Select the members role.</Hint>
          <ErrorHint>
            {hasLeadMembers && (
              <p>Bulk changes apply to all except leads; lead role can only be updated individually.</p>
            )}
            {hasInactiveMembers && <p>Enable the inactive member(s) first to change their role.</p>}
            {hasAccountDeactivatedMembers && (
              <p>
                Deactivated accounts in precisionFDA cannot be modified. An admin must reactivate the accounts first.
              </p>
            )}
          </ErrorHint>
          <ErrorMessage errors={errors} name="role" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
        <FieldGroup>
          <MemberTable>
            <MemberItemHeader>
              <div>User</div>
              <div>Username</div>
              <div>Role</div>
              <div>Status</div>
            </MemberItemHeader>
            <MemberItemsWrapper>
              {members.map((member, index) => (
                <MemberItem
                  key={member.user_name}
                  $isDisabled={member.active === 'Account deactivated' || member.role === 'lead'}
                >
                  <div>{member.title}</div>
                  <div>{member.user_name}</div>
                  <div>{member.role}</div>
                  <StatusPill $active={member.active === 'Active'}>{member.active}</StatusPill>
                </MemberItem>
              ))}
            </MemberItemsWrapper>
          </MemberTable>
        </FieldGroup>
      </StyledFields>
      <StyledFooter>
        <div className="flex align-center gap-2">
          {hasActiveMembers && (
            <Button
              data-variant="warning"
              type="button"
              onClick={() => onToggleMemberships('disable')}
              disabled={mutation.isPending}
              aria-label="Change member roles"
            >
              Disable All
            </Button>
          )}
          {hasInactiveMembers && (
            <Button
              data-variant="success"
              type="button"
              onClick={() => onToggleMemberships('enable')}
              disabled={mutation.isPending}
              aria-label="Change member roles"
            >
              Enable All
            </Button>
          )}
        </div>
        <div className="flex align-center gap-2">
          <Button type="button" onClick={onCancel} disabled={mutation.isPending} aria-label="Close modal">
            Cancel
          </Button>
          <Button
            data-variant="primary"
            type="submit"
            disabled={
              !selectedRole?.value || Object.keys(errors).length > 0 || mutation.isPending || hasInactiveMembers
            }
            aria-label="Change member roles"
            data-tooltip-id="change-role-tooltip"
            data-tooltip-content={tooltipMsg}
          >
            Change Role
          </Button>
          <Tooltip id="change-role-tooltip" />
        </div>
      </StyledFooter>
    </form>
  )
}

export const useBulkChangeMemberRolesModal = ({
  spaceId,
  members,
}: {
  spaceId: number
  members: SpaceMembership[]
}) => {
  const { isShown, setShowModal } = useModal()
  const modalComp = isShown && (
    <ModalNext
      id="modal-bulk-change-membership-role"
      data-testid="modal-bulk-change-membership-role"
      isShown={isShown}
      hide={() => setShowModal(false)}
      variant="medium"
    >
      <ModalHeaderTop disableClose={false} headerText="Change Member Roles" hide={() => setShowModal(false)} />
      <BulkChangeMemberRolesForm spaceId={spaceId} members={members} onClose={() => setShowModal(false)} />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
