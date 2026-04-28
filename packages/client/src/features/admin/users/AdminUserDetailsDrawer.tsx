import { Drawer } from '@base-ui/react/drawer'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { Pencil, X } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import type { BackendError } from '@/api/types'
import { Button } from '@/components/Button'
import { Checkbox } from '@/components/CheckboxNext'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { COMPUTE_RESOURCE_LABELS, DATABASE_RESOURCE_LABELS, RESOURCE_LABELS, type ResourceKey } from '@/types/user'
import { formatDate } from '@/utils/formatting'
import { useAuthUser } from '../../auth/useAuthUser'
import { formatNumberUS } from '../../home/utils'
import { ModalScroll } from '../../modal/styles'
import { useConfirm } from '../../modal/useConfirm'
import {
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

const handleMutationError = (error: AxiosError<BackendError>, fallbackMessage: string) => {
  if (error.response?.data?.error?.message) {
    toastError(`Error: ${error.response.data.error.message}`)
    return
  }
  toastError(fallbackMessage)
}

// ─── Shared layout primitives ────────────────────────────────────────────────

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-3 py-1.5">
    <dt className="w-40 shrink-0 text-xs text-(--c-text-400)">{label}</dt>
    <dd className="min-w-0 flex-1 text-sm text-(--c-text-700)">{children}</dd>
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
        <div className="flex h-[26px] items-center gap-2">
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
      <div className="group flex h-[26px] items-center gap-1.5">
        <span>{formatCurrency(value)}</span>
        {value !== undefined && (
          <button
            type="button"
            onClick={startEdit}
            aria-label={`Edit ${label}`}
            className="opacity-0 transition-opacity group-hover:opacity-60 hover:opacity-100! text-(--c-text-400)"
          >
            <Pencil size={11} />
          </button>
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
            className="flex cursor-pointer items-center gap-2 py-0.5 text-sm text-(--c-text-700) select-none"
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
  queryClient,
}: {
  userId: number
  settings: AdminUserDetails['cloudResourceSettings']
  queryClient: ReturnType<typeof useQueryClient>
}) => {
  const [pendingResources, setPendingResources] = useState<Set<ResourceKey>>(new Set())
  const enabledSet = new Set(settings?.resources ?? [])

  const onMutateSuccess = () => invalidateAdminUserQueries(queryClient)

  const totalLimitMutation = useMutation({
    mutationKey: ['set-total-limit', userId],
    mutationFn: (limit: number) => setTotalLimit([userId], limit),
    onSuccess: () => {
      toastSuccess('Total limit updated')
      onMutateSuccess()
    },
    onError: (e: AxiosError<BackendError>) => handleMutationError(e, 'Failed to update total limit'),
  })

  const jobLimitMutation = useMutation({
    mutationKey: ['set-job-limit', userId],
    mutationFn: (limit: number) => setJobLimit([userId], limit),
    onSuccess: () => {
      toastSuccess('Job limit updated')
      onMutateSuccess()
    },
    onError: (e: AxiosError<BackendError>) => handleMutationError(e, 'Failed to update job limit'),
  })

  const toggleResource = async (resource: ResourceKey, currentlyEnabled: boolean) => {
    setPendingResources(prev => new Set([...prev, resource]))
    try {
      if (currentlyEnabled) {
        await bulkDisableResource([userId], resource)
      } else {
        await bulkEnableResource([userId], resource)
      }
      onMutateSuccess()
    } catch {
      toastError('Failed to update resource')
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

// ─── Drawer body ─────────────────────────────────────────────────────────────

type DrawerBodyProps = {
  details: AdminUserDetails
  queryClient: ReturnType<typeof useQueryClient>
  isPendingActivation: boolean
  isDeactivated: boolean
  isCurrentUser: boolean
  isResendPending: boolean
  isResetMfaPending: boolean
  isDisablePending: boolean
  isUnlockPending: boolean
  canUnlock: boolean
  onResendActivationEmail: () => void
  onResetMfa: () => void
  onDisableUser: () => void
  onUnlockUser: () => void
}

const DrawerBody = ({
  details,
  queryClient,
  isPendingActivation,
  isDeactivated,
  isCurrentUser,
  isResendPending,
  isResetMfaPending,
  isDisablePending,
  isUnlockPending,
  canUnlock,
  onResendActivationEmail,
  onResetMfa,
  onDisableUser,
  onUnlockUser,
}: DrawerBodyProps) => {
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
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClassName[details.userState]}`}
        >
          {statusLabel[details.userState]}
        </span>
      </Row>
      <Row label="Joined">{formatDateTime(details.createdAt)}</Row>
      <Row label="Last login">{formatDateTime(details.lastLogin)}</Row>
      <Row label="Last updated">{formatDateTime(details.updatedAt)}</Row>
      <Row label="Timezone">{details.timeZone ?? 'N/A'}</Row>

      <SectionHeading title="Organization" />
      <Row label="Name">{details.organization.name}</Row>
      <Row label="Handle">{details.organization.handle}</Row>
      <Row label="Admin">{details.organization.adminFullName ?? 'N/A'}</Row>
      <Row label="Type">{details.organization.singular ? 'Single-user' : 'Multi-user'}</Row>

      <SectionHeading title="Access" />
      {permissionRows.map(({ label, enabled }) => (
        <Row key={label} label={label}>
          <span className={enabled ? 'text-(--success-600)' : 'text-(--c-text-400)'}>{enabled ? 'Yes' : 'No'}</span>
        </Row>
      ))}

      <SectionHeading title="Cloud Resources" />
      <CloudResourcesSection userId={details.id} settings={details.cloudResourceSettings} queryClient={queryClient} />

      {details.disableMessage ? (
        <>
          <SectionHeading title="Disable Message" />
          <div className="rounded border border-(--highlight-200) bg-(--highlight-50) px-3 py-2 text-sm text-(--highlight-800)">
            {details.disableMessage}
          </div>
        </>
      ) : null}

      <SectionHeading title="Actions" />
      <div className="flex flex-col divide-y divide-(--tertiary-200)">
        <div className="flex items-center gap-4 py-2.5">
          <Button
            data-variant="outline"
            disabled={!isPendingActivation || isResendPending}
            onClick={onResendActivationEmail}
            style={{ minWidth: 210 }}
          >
            Resend Activation Email
          </Button>
          <span className="text-xs text-(--c-text-400)">
            Send a new activation link to the user's email address. Only available for accounts pending activation.
          </span>
        </div>
        <div className="flex items-center gap-4 py-2.5">
          <Button data-variant="outline" disabled={isResetMfaPending} onClick={onResetMfa} style={{ minWidth: 210 }}>
            Reset MFA
          </Button>
          <span className="text-xs text-(--c-text-400)">
            Clear the user's multi-factor authentication setup so they can reconfigure it on next login.
          </span>
        </div>
        <div className="flex items-center gap-4 py-2.5">
          <Button
            data-variant="warning"
            disabled={isDeactivated || isCurrentUser || isDisablePending}
            onClick={onDisableUser}
            style={{ minWidth: 210 }}
          >
            Disable User
          </Button>
          <span className="text-xs text-(--c-text-400)">
            Deactivate this account and prevent the user from logging in.
          </span>
        </div>
        <div className="flex items-center gap-4 py-2.5">
          <Button
            data-variant="outline"
            disabled={!canUnlock || isUnlockPending}
            onClick={onUnlockUser}
            style={{ minWidth: 210 }}
          >
            Unlock User
          </Button>
          <span className="text-xs text-(--c-text-400)">
            Restore access to a locked account so the user can log in again.
          </span>
        </div>
      </div>
    </dl>
  )
}

// ─── Drawer root ─────────────────────────────────────────────────────────────

export const AdminUserDetailsDrawer = ({ userId, open, onClose }: AdminUserDetailsDrawerProps) => {
  const queryClient = useQueryClient()
  const currentUser = useAuthUser()
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => fetchAdminUserDetails(userId as number),
    enabled: open && userId != null,
    refetchOnWindowFocus: false,
  })

  const resendActivationEmailMutation = useMutation({
    mutationKey: ['resend-activation-email', userId],
    mutationFn: () => userResendActivationEmail(userId as number),
    onSuccess: () => {
      toastSuccess('Activation email was resent to the user')
      invalidateAdminUserQueries(queryClient)
    },
    onError: (e: AxiosError<BackendError>) => handleMutationError(e, 'Failed to resend activation email to the user'),
  })

  const resetMfaMutation = useMutation({
    mutationKey: ['reset-mfa', userId],
    mutationFn: () => userResetMfa(userId as number),
    onSuccess: () => {
      toastSuccess('Multi-factor authentication was reset for the user')
      invalidateAdminUserQueries(queryClient)
    },
    onError: (e: AxiosError<BackendError>) => handleMutationError(e, 'Failed to reset multi-factor authentication'),
  })

  const disableUserMutation = useMutation({
    mutationKey: ['deactivate-user', userId],
    mutationFn: () => bulkDeactivate([userId as number]),
    onSuccess: () => {
      toastSuccess('User was successfully deactivated!')
      invalidateAdminUserQueries(queryClient)
    },
    onError: (e: AxiosError<BackendError>) => handleMutationError(e, 'Error deactivating user'),
  })

  const unlockUserMutation = useMutation({
    mutationKey: ['unlock-user', userId],
    mutationFn: () => userUnlock(userId as number),
    onSuccess: () => {
      toastSuccess('User was successfully unlocked!')
      invalidateAdminUserQueries(queryClient)
    },
    onError: (e: AxiosError<BackendError>) => handleMutationError(e, 'Error unlocking user'),
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
          Are you sure you want to disable <strong>{data?.fullName ?? 'this user'}</strong>?
        </p>
      </ModalScroll>
    ),
  })

  const isPendingActivation = data?.permissions.pendingActivation ?? false
  const isDeactivated = data?.userState === 'deactivated'
  const isCurrentUser = data?.id === currentUser?.id
  const canUnlock = canAdminUnlockUsers(data ? [data] : [])

  return (
    <Drawer.Root open={open} onOpenChange={(nextOpen: boolean) => !nextOpen && onClose()} swipeDirection="right">
      <Drawer.Portal keepMounted>
        <Drawer.Backdrop className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 data-closed:opacity-0 data-starting-style:opacity-0 data-ending-style:opacity-0" />
        <Drawer.Viewport className="fixed inset-0 z-50">
          <Drawer.Popup className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[600px] outline-none transition-transform duration-200 ease-out data-closed:translate-x-full data-starting-style:translate-x-full data-ending-style:translate-x-full">
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
                    {data?.userState ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClassName[data.userState]}`}
                      >
                        {statusLabel[data.userState]}
                      </span>
                    ) : null}
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
                {!isLoading && !error && data ? (
                  <DrawerBody
                    details={data}
                    queryClient={queryClient}
                    isPendingActivation={isPendingActivation}
                    isDeactivated={isDeactivated}
                    isCurrentUser={isCurrentUser}
                    isResendPending={resendActivationEmailMutation.isPending}
                    isResetMfaPending={resetMfaMutation.isPending}
                    isDisablePending={disableUserMutation.isPending}
                    isUnlockPending={unlockUserMutation.isPending}
                    canUnlock={canUnlock}
                    onResendActivationEmail={() => void resendActivationEmailMutation.mutateAsync()}
                    onResetMfa={() => void resetMfaMutation.mutateAsync()}
                    onDisableUser={openDisableUserConfirmation}
                    onUnlockUser={() => void unlockUserMutation.mutateAsync()}
                  />
                ) : null}
              </div>

              <DisableUserConfirm />
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
