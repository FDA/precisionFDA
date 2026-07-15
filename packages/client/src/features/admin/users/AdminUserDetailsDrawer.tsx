import { Drawer } from '@base-ui/react/drawer'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, X } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import { getBackendErrorMessage } from '@/api/types'
import { Button } from '@/components/Button'
import { Checkbox } from '@/components/CheckboxNext'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { COMPUTE_RESOURCE_LABELS, DATABASE_RESOURCE_LABELS, RESOURCE_LABELS, type ResourceKey } from '@/types/user'
import { relativeTimeAgo } from '@/utils/datetime'
import { formatDate } from '@/utils/formatting'
import { useAuthUser } from '../../auth/useAuthUser'
import { formatNumberUS } from '../../home/utils'
import { ModalScroll } from '../../modal/modal.styles'
import { useConfirm } from '../../modal/useConfirm'
import {
  bulkActivate,
  bulkDeactivate,
  bulkDisableResource,
  bulkEnableResource,
  fetchAdminUserDetails,
  setJobLimit,
  setTotalLimit,
  userResendActivationEmail,
  userResetMfa,
  userUnlock,
} from './api'
import { canAdminUnlockUsers } from './canAdminUnlockUsers'
import type { AdminUserDetails } from './types'

type AdminUserDetailsDrawerProps = {
  userId: number | null
  open: boolean
  onClose: () => void
}

const statusLabel: Record<AdminUserDetails['userState'], string> = {
  active: 'Active',
  deactivated: 'Deactivated',
  locked: 'Locked',
  'n/a': 'N/A',
}

const statusClassName: Record<AdminUserDetails['userState'], string> = {
  active: 'bg-(--success-100) text-(--success-700)',
  deactivated: 'bg-(--highlight-100) text-(--highlight-800)',
  locked: 'bg-(--warning-100) text-(--warning-700)',
  'n/a': 'bg-(--tertiary-100) text-(--tertiary-500)',
}

const formatDateTime = (value: string | null) => (value ? formatDate(value) : 'N/A')
const formatCurrency = (value: number | undefined) => (typeof value === 'number' ? `$${formatNumberUS(value)}` : 'N/A')
const invalidateAdminUserQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  queryClient.invalidateQueries({ queryKey: ['admin-user'] })
}

const useAdminUserAction = <TData, TVariables = void>({
  mutationKey,
  mutationFn,
  successMessage,
  errorMessage,
}: {
  mutationKey: readonly unknown[]
  mutationFn: (variables: TVariables) => Promise<TData>
  successMessage: string
  errorMessage: string
}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      toastSuccess(successMessage)
      invalidateAdminUserQueries(queryClient)
    },
    onError: error => toastError(getBackendErrorMessage(error, errorMessage)),
  })
}

// ─── Shared layout primitives ────────────────────────────────────────────────

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-3 py-1.5">
    <dt className="w-40 shrink-0 text-sm text-(--c-text-600)">{label}</dt>
    <dd className="min-w-0 flex-1 text-sm break-words text-(--c-text-700)">{children}</dd>
  </div>
)

const SectionHeading = ({ title }: { title: string }) => (
  <div className="flex items-center gap-2 pt-5 pb-2 first:pt-0">
    <span className="whitespace-nowrap text-[11px] font-semibold tracking-widest text-(--c-text-400) uppercase">
      {title}
    </span>
    <div className="h-px flex-1 bg-(--tertiary-250)" />
  </div>
)

const YesNoBadge = ({ value }: { value: boolean }) => (
  <span
    className={`inline-flex w-8 items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium ${
      value ? 'bg-(--success-100) text-(--success-700)' : 'bg-(--warning-100) text-(--warning-700)'
    }`}
  >
    {value ? 'Yes' : 'No'}
  </span>
)

const StatusBadge = ({ state }: { state: AdminUserDetails['userState'] }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClassName[state]}`}>
    {statusLabel[state]}
  </span>
)

// ─── Inline limit editor ─────────────────────────────────────────────────────

const LimitField = ({
  label,
  value,
  isSaving,
  onSave,
}: {
  label: string
  value: number | undefined
  isSaving: boolean
  onSave: (v: number) => void
}) => {
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')

  const startEdit = () => {
    setInput(String(value ?? ''))
    setEditing(true)
  }

  const cancel = () => setEditing(false)

  const save = () => {
    const parsed = parseFloat(input)
    if (!Number.isNaN(parsed) && parsed >= 0) {
      onSave(parsed)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <Row label={label}>
        <div className="flex h-6.5 items-center gap-2">
          <span className="text-xs text-(--c-text-400)">$</span>
          <input
            type="number"
            min={0}
            step={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') save()
              if (e.key === 'Escape') cancel()
            }}
            className="w-28 rounded border border-(--tertiary-300) bg-background px-2 py-0.5 text-sm text-(--c-text-700) focus:outline-none focus:ring-1 focus:ring-(--primary-400)"
          />
          <Button
            data-variant="primary"
            disabled={isSaving}
            onClick={save}
            style={{ padding: '2px 10px', fontSize: 12 }}
          >
            Save
          </Button>
          <button type="button" onClick={cancel} className="text-xs text-(--c-text-400) hover:text-(--c-text-700)">
            Cancel
          </button>
        </div>
      </Row>
    )
  }

  return (
    <Row label={label}>
      <div className="group flex h-6.5 items-center gap-1.5">
        {value !== undefined ? (
          <button
            type="button"
            onClick={startEdit}
            aria-label={`Edit ${label}`}
            className="group flex items-center gap-1.5 rounded text-sm text-(--c-text-700) hover:text-(--c-text-900) focus:outline-none focus-visible:ring-1 focus-visible:ring-(--primary-400)"
          >
            <span className="group-hover:underline group-hover:decoration-dashed group-hover:underline-offset-2">
              {formatCurrency(value)}
            </span>
            <Pencil size={11} className="text-(--c-text-400) opacity-40 transition-opacity group-hover:opacity-100" />
          </button>
        ) : (
          <span>{formatCurrency(value)}</span>
        )}
      </div>
    </Row>
  )
}

// ─── Resource checkbox grid ───────────────────────────────────────────────────

const COMPUTE_RESOURCES = Object.keys(COMPUTE_RESOURCE_LABELS) as ResourceKey[]
const DATABASE_RESOURCES = Object.keys(DATABASE_RESOURCE_LABELS) as ResourceKey[]

const ResourceGroup = ({
  groupLabel,
  resources,
  enabled,
  pending,
  onToggle,
}: {
  groupLabel: string
  resources: ResourceKey[]
  enabled: Set<string>
  pending: Set<string>
  onToggle: (r: ResourceKey, isEnabled: boolean) => void
}) => (
  <div className="mt-2">
    <div className="mb-1.5 text-[11px] font-medium text-(--c-text-400) uppercase tracking-wide">{groupLabel}</div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
      {resources.map(r => {
        const isEnabled = enabled.has(r)
        const isPending = pending.has(r)
        return (
          <label
            key={r}
            htmlFor={`resource-${r}`}
            className="flex w-fit cursor-pointer items-center gap-2 py-0.5 text-sm text-(--c-text-700) select-none"
          >
            <Checkbox
              id={`resource-${r}`}
              checked={isEnabled}
              disabled={isPending}
              onChange={() => onToggle(r, isEnabled)}
            />
            {RESOURCE_LABELS[r]}
          </label>
        )
      })}
    </div>
  </div>
)

const CloudResourcesSection = ({
  userId,
  settings,
}: {
  userId: number
  settings: AdminUserDetails['cloudResourceSettings']
}) => {
  const queryClient = useQueryClient()
  const [pendingResources, setPendingResources] = useState<Set<ResourceKey>>(new Set())
  const enabledSet = new Set(settings?.resources ?? [])

  const totalLimitMutation = useAdminUserAction({
    mutationKey: ['set-total-limit', userId],
    mutationFn: (limit: number) => setTotalLimit([userId], limit),
    successMessage: 'Total limit updated',
    errorMessage: 'Failed to update total limit',
  })

  const jobLimitMutation = useAdminUserAction({
    mutationKey: ['set-job-limit', userId],
    mutationFn: (limit: number) => setJobLimit([userId], limit),
    successMessage: 'Job limit updated',
    errorMessage: 'Failed to update job limit',
  })

  const toggleResource = async (resource: ResourceKey, currentlyEnabled: boolean) => {
    setPendingResources(prev => new Set([...prev, resource]))
    try {
      if (currentlyEnabled) {
        await bulkDisableResource([userId], resource)
      } else {
        await bulkEnableResource([userId], resource)
      }
      invalidateAdminUserQueries(queryClient)
    } catch (error) {
      toastError(getBackendErrorMessage(error, 'Failed to update resource'))
    } finally {
      setPendingResources(prev => {
        const next = new Set(prev)
        next.delete(resource)
        return next
      })
    }
  }

  return (
    <>
      <LimitField
        label="Total limit"
        value={settings?.total_limit}
        isSaving={totalLimitMutation.isPending}
        onSave={v => void totalLimitMutation.mutateAsync(v)}
      />
      <LimitField
        label="Job limit"
        value={settings?.job_limit}
        isSaving={jobLimitMutation.isPending}
        onSave={v => void jobLimitMutation.mutateAsync(v)}
      />
      {settings ? (
        <>
          <ResourceGroup
            groupLabel="Compute instances"
            resources={COMPUTE_RESOURCES}
            enabled={enabledSet}
            pending={pendingResources}
            onToggle={toggleResource}
          />
          <ResourceGroup
            groupLabel="Database instances"
            resources={DATABASE_RESOURCES}
            enabled={enabledSet}
            pending={pendingResources}
            onToggle={toggleResource}
          />
        </>
      ) : (
        <div className="mt-2 text-sm text-(--c-text-400)">No resource settings available.</div>
      )}
    </>
  )
}

// ─── Actions ─────────────────────────────────────────────────────────────────

const ActionRow = ({
  label,
  description,
  variant = 'outline',
  disabled,
  onClick,
}: {
  label: string
  description: string
  variant?: 'outline' | 'primary' | 'warning'
  disabled: boolean
  onClick: () => void
}) => (
  <div className="flex items-center gap-4 py-2.5">
    <Button data-variant={variant} disabled={disabled} onClick={onClick} style={{ minWidth: 210 }}>
      {label}
    </Button>
    <span className="text-xs text-(--c-text-400)">{description}</span>
  </div>
)

const UserActionsSection = ({ details }: { details: AdminUserDetails }) => {
  const currentUser = useAuthUser()

  const resendActivationEmailMutation = useAdminUserAction({
    mutationKey: ['resend-activation-email', details.id],
    mutationFn: () => userResendActivationEmail(details.id),
    successMessage: 'Activation email was resent to the user',
    errorMessage: 'Failed to resend activation email to the user',
  })

  const resetMfaMutation = useAdminUserAction({
    mutationKey: ['reset-mfa', details.id],
    mutationFn: () => userResetMfa(details.id),
    successMessage: 'Multi-factor authentication was reset for the user',
    errorMessage: 'Failed to reset multi-factor authentication',
  })

  const disableUserMutation = useAdminUserAction({
    mutationKey: ['deactivate-user', details.id],
    mutationFn: () => bulkDeactivate([details.id]),
    successMessage: 'User was successfully deactivated!',
    errorMessage: 'Error deactivating user',
  })

  const activateUserMutation = useAdminUserAction({
    mutationKey: ['activate-user', details.id],
    mutationFn: () => bulkActivate([details.id]),
    successMessage: 'User was successfully activated!',
    errorMessage: 'Error activating user',
  })

  const unlockUserMutation = useAdminUserAction({
    mutationKey: ['unlock-user', details.id],
    mutationFn: () => userUnlock(details.id),
    successMessage: 'User was successfully unlocked!',
    errorMessage: 'Error unlocking user',
  })

  const { open: openDisableUserConfirmation, Confirm: DisableUserConfirm } = useConfirm({
    onOk: () => {
      void disableUserMutation.mutateAsync()
    },
    okText: 'Disable User',
    headerText: 'Disable User',
    dataVariant: 'warning',
    body: (
      <ModalScroll>
        <p>
          Are you sure you want to disable <strong>{details.fullName}</strong>?
        </p>
      </ModalScroll>
    ),
  })

  const isPendingActivation = details.permissions.pendingActivation
  const isDeactivated = details.userState === 'deactivated'
  const isCurrentUser = details.id === currentUser?.id
  const canUnlock = canAdminUnlockUsers([details])

  return (
    <>
      <div className="flex flex-col divide-y divide-(--tertiary-200)">
        <ActionRow
          label="Resend Activation Email"
          description="Send a new activation link to the user's email address. Only available for accounts pending activation."
          disabled={!isPendingActivation || resendActivationEmailMutation.isPending}
          onClick={() => void resendActivationEmailMutation.mutateAsync()}
        />
        <ActionRow
          label="Reset MFA"
          description="Clear the user's multi-factor authentication setup so they can reconfigure it on next login."
          disabled={resetMfaMutation.isPending}
          onClick={() => void resetMfaMutation.mutateAsync()}
        />
        {isDeactivated ? (
          <ActionRow
            label="Activate User"
            description="Reactivate this account so the user can log in again."
            variant="primary"
            disabled={activateUserMutation.isPending}
            onClick={() => void activateUserMutation.mutateAsync()}
          />
        ) : (
          <ActionRow
            label="Disable User"
            description="Deactivate this account and prevent the user from logging in."
            variant="warning"
            disabled={isCurrentUser || disableUserMutation.isPending}
            onClick={openDisableUserConfirmation}
          />
        )}
        <ActionRow
          label="Unlock User"
          description="Restore access to a locked account so the user can log in again."
          disabled={!canUnlock || unlockUserMutation.isPending}
          onClick={() => void unlockUserMutation.mutateAsync()}
        />
      </div>
      <DisableUserConfirm />
    </>
  )
}

// ─── Drawer body ─────────────────────────────────────────────────────────────

const DrawerBody = ({ details }: { details: AdminUserDetails }) => {
  const lastLoginAgo = relativeTimeAgo(details.lastLogin)

  const permissionRows: { label: string; enabled: boolean }[] = [
    { label: 'Pending activation', enabled: details.permissions.pendingActivation },
    { label: 'Government user', enabled: details.permissions.isGovernmentUser },
    { label: 'Org admin', enabled: details.permissions.isOrgAdmin },
    { label: 'Site admin', enabled: details.permissions.isSiteAdmin },
    { label: 'Review space admin', enabled: details.permissions.isReviewSpaceAdmin },
    { label: 'Challenge admin', enabled: details.permissions.isChallengeAdmin },
  ]

  return (
    <dl className="px-5 py-4">
      <SectionHeading title="Account" />
      <Row label="Full name">{details.fullName}</Row>
      <Row label="Username">@{details.dxuser}</Row>
      <Row label="Email">{details.email}</Row>
      <Row label="Status">
        <StatusBadge state={details.userState} />
      </Row>
      <Row label="Single sign-on">
        <YesNoBadge value={details.isSSO} />
      </Row>
      <Row label="Joined">{formatDateTime(details.createdAt)}</Row>
      <Row label="Last login">
        {formatDateTime(details.lastLogin)}
        {lastLoginAgo ? <span className="ml-1.5 text-xs text-(--c-text-400)">({lastLoginAgo})</span> : null}
      </Row>
      <Row label="Last updated">{formatDateTime(details.updatedAt)}</Row>
      <Row label="Timezone">{details.timeZone ?? 'N/A'}</Row>

      <SectionHeading title="Organization" />
      <Row label="Name">{details.organization.name}</Row>
      <Row label="Handle">{details.organization.handle}</Row>
      <Row label="Admin">{details.organization.adminFullName ?? 'N/A'}</Row>
      <Row label="Type">{details.organization.singular ? 'Single-user' : 'Multi-user'}</Row>

      <SectionHeading title="Access" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 py-1">
        {permissionRows.map(({ label, enabled }) => (
          <div key={label} className="flex items-center justify-between gap-2 rounded px-1 py-1">
            <span className="text-sm text-(--c-text-600)">{label}</span>
            <YesNoBadge value={enabled} />
          </div>
        ))}
      </div>

      <SectionHeading title="Cloud Resources" />
      <CloudResourcesSection userId={details.id} settings={details.cloudResourceSettings} />

      {details.disableMessage ? (
        <>
          <SectionHeading title="Disable Message" />
          <div className="rounded border border-(--highlight-200) bg-(--highlight-50) px-3 py-2 text-sm text-(--highlight-800)">
            {details.disableMessage}
          </div>
        </>
      ) : null}

      <SectionHeading title="Actions" />
      <UserActionsSection details={details} />
    </dl>
  )
}

// ─── Drawer root ─────────────────────────────────────────────────────────────

export const AdminUserDetailsDrawer = ({ userId, open, onClose }: AdminUserDetailsDrawerProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => fetchAdminUserDetails(userId as number),
    enabled: open && userId != null,
    refetchOnWindowFocus: false,
  })

  return (
    <Drawer.Root open={open} onOpenChange={(nextOpen: boolean) => !nextOpen && onClose()} swipeDirection="right">
      <Drawer.Portal keepMounted>
        <Drawer.Backdrop className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 data-closed:opacity-0 data-starting-style:opacity-0 data-ending-style:opacity-0" />
        <Drawer.Viewport className="fixed inset-0 z-50">
          <Drawer.Popup className="fixed inset-y-0 right-0 z-50 flex w-full max-w-150 outline-none transition-transform duration-200 ease-out data-closed:translate-x-full data-starting-style:translate-x-full data-ending-style:translate-x-full">
            <Drawer.Content className="flex h-full w-full flex-col overflow-hidden border-l border-(--tertiary-250) bg-background shadow-[-16px_0_48px_rgba(0,0,0,0.16)] outline-none">
              <Drawer.Description className="sr-only">
                Admin-visible account details, roles, and cloud resource access.
              </Drawer.Description>

              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-(--tertiary-250) px-5 py-4">
                <div className="min-w-0">
                  <Drawer.Title className="truncate text-base font-semibold text-(--c-text-700)">
                    {data?.fullName ?? 'User details'}
                  </Drawer.Title>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {data?.dxuser ? <span className="text-xs text-(--c-text-400)">@{data.dxuser}</span> : null}
                    {data?.userState ? <StatusBadge state={data.userState} /> : null}
                  </div>
                </div>
                <Drawer.Close
                  aria-label="Close user details"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded text-(--c-text-500) transition-colors hover:bg-(--background-shaded-100) hover:text-(--c-text-700)"
                >
                  <X size={16} aria-hidden="true" />
                </Drawer.Close>
              </div>

              {/* Scrollable body */}
              <div className="min-h-0 flex-1 overflow-y-auto">
                {isLoading ? <div className="px-5 py-4 text-sm text-(--c-text-400)">Loading…</div> : null}
                {!isLoading && error ? (
                  <div className="px-5 py-4 text-sm text-(--warning-600)">Failed to load user details.</div>
                ) : null}
                {!isLoading && !error && data ? <DrawerBody details={data} /> : null}
              </div>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
