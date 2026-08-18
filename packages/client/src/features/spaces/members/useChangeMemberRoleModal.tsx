import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import type React from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/utils/cn'
import { Callout } from '../../../components/Callout'
import { useModal } from '../../modal/useModal'
import type { MemberRole, SpaceMembership, UpdateRolesFormValues } from './members.types'
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

  const roleOptions: { value: MemberRole; label: string }[] = (
    [
      { value: 'admin', label: LABEL.admin },
      { value: 'contributor', label: LABEL.contributor },
      { value: 'viewer', label: LABEL.viewer },
      { value: 'lead', label: LABEL.lead },
    ] as { value: MemberRole; label: string }[]
  ).filter(r => member.to_roles.includes(r.value))

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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="change-member-role-username" className="text-sm font-medium text-foreground">
            Username
          </label>
          <Input id="change-member-role-username" value={member.user_name} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="change-member-role-current" className="text-sm font-medium text-foreground">
            Current role
          </label>
          <Input
            id="change-member-role-current"
            value={isMemberDisabled ? `${member.role} (disabled)` : member.role}
            disabled
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="select_member_role" className="text-sm font-medium text-foreground">
            Change to role
          </label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => {
              const disabled = isSubmitting || isMemberDisabled
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
                  <SelectContent side="bottom" align="start">
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
          {member.active === 'Active' && <p className="text-sm text-muted-foreground">Select the members role.</p>}
          <p className="text-sm text-destructive">
            {member.active === 'Inactive' && 'Enable the member first to change their role.'}
            {member.active === 'Account deactivated' &&
              'Account is deactivated in precisionFDA and cannot be modified. An admin must reactivate the account first.'}
          </p>
          <ErrorMessage
            errors={errors}
            name="role"
            render={({ message }) => <p className="text-sm text-destructive">{message}</p>}
          />
        </div>
        {isLeadSelected && (
          <Callout data-variant="warning">
            Changing this user to Lead role will make you admin in this space. The new Lead will assume billing for this
            Space, including storage costs for files and run costs for App Executions.
          </Callout>
        )}
      </div>
      <DialogFooter className="mt-6 sm:justify-between">
        <div>
          {canDisableOrEnable && (
            <Button
              variant={member.active === 'Active' ? 'destructive' : 'success'}
              type="button"
              onClick={onDisableToggle}
              disabled={isSubmitting || member.active === 'Account deactivated'}
              aria-label={member.active === 'Active' ? 'Disable member' : 'Enable member'}
            >
              {!isMemberDisabled ? 'Disable Member' : 'Enable Member'}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting} aria-label="Close modal">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={Object.keys(errors).length > 0 || isSubmitting || isMemberDisabled}
            aria-label="Change member role"
          >
            Change Role
          </Button>
        </div>
      </DialogFooter>
    </form>
  )
}

export const useChangeMemberRoleModal = ({ spaceId, member }: { spaceId: number; member: SpaceMembership }) => {
  const { isShown, setShowModal } = useModal()
  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent
        id="modal-change-membership-role"
        data-testid="modal-change-membership-role"
        variant="medium"
        className="gap-4"
      >
        <DialogHeader>
          <DialogTitle>Change member role</DialogTitle>
        </DialogHeader>
        <ChangeMemberRoleForm spaceId={spaceId} member={member} onClose={() => setShowModal(false)} />
      </DialogContent>
    </Dialog>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
