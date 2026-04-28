import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { BackendError } from '@/api/types'
import { Button } from '@/components/Button'
import { Checkbox } from '@/components/CheckboxNext'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import {
  COMPUTE_RESOURCE_LABELS,
  DATABASE_RESOURCE_LABELS,
  RESOURCE_LABELS,
  RESOURCES,
  type ResourceKey,
} from '@/types/user'
import Menu from '../../../components/Menu/Menu'
import {
  bulkDisableAllResources,
  bulkDisableResource,
  bulkEnableAllResources,
  bulkEnableResource,
  setJobLimit,
  setTotalLimit,
} from './api'
import type { User } from './types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COMPUTE_RESOURCES = Object.keys(COMPUTE_RESOURCE_LABELS) as ResourceKey[]
const DATABASE_RESOURCES = Object.keys(DATABASE_RESOURCE_LABELS) as ResourceKey[]

const isResourceEnabled = (users: User[], resource: ResourceKey) =>
  users.length > 0 && users.every(u => u.cloudResourceSettings?.resources.includes(resource))

const areAllEnabled = (users: User[]) =>
  users.length > 0 && users.every(u => RESOURCES.every(r => u.cloudResourceSettings?.resources.includes(r)))

const invalidateQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  queryClient.invalidateQueries({ queryKey: ['admin-user'] })
}

const handleError = (e: AxiosError<BackendError>, fallback: string) => {
  if (e.response?.data?.error?.message) {
    toastError(`Error: ${e.response.data.error.message}`)
  } else {
    toastError(fallback)
  }
}

const getCommonLimit = (users: User[], key: 'total_limit' | 'job_limit'): string => {
  if (users.length === 0) return ''
  const values = users.map(u => u.cloudResourceSettings?.[key])
  const first = values[0]
  return values.every(v => v === first) ? String(first ?? '') : ''
}

// ─── Limit row ────────────────────────────────────────────────────────────────

const LimitRow = ({
  label,
  value,
  onChange,
  onApply,
  disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  onApply: () => void
  disabled: boolean
}) => (
  <div className="flex items-center gap-2 py-1">
    <span className="w-24 shrink-0 text-xs text-(--c-text-400)">{label}</span>
    <span className="text-xs text-(--c-text-400)">$</span>
    <input
      type="number"
      min={0}
      step={0.01}
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => {
        e.stopPropagation()
        if (e.key === 'Enter' && !disabled) onApply()
      }}
      className="w-24 rounded border border-(--tertiary-300) bg-background px-2 py-0.5 text-sm text-(--c-text-700) focus:outline-none focus:ring-1 focus:ring-(--primary-400)"
    />
    <Button data-variant="primary" disabled={disabled} onClick={onApply} style={{ padding: '2px 10px', fontSize: 12 }}>
      Apply
    </Button>
  </div>
)

// ─── Resource checkbox group ──────────────────────────────────────────────────

const ResourceGroup = ({
  groupLabel,
  resources,
  users,
  pending,
  disabled,
  onToggle,
}: {
  groupLabel: string
  resources: ResourceKey[]
  users: User[]
  pending: Set<ResourceKey>
  disabled: boolean
  onToggle: (r: ResourceKey, enabled: boolean) => void
}) => (
  <div className="px-2 pb-2">
    <div className="mb-2 text-[11px] font-semibold tracking-widest text-(--c-text-400) uppercase">{groupLabel}</div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
      {resources.map(r => {
        const enabled = isResourceEnabled(users, r)
        return (
          <label
            key={r}
            htmlFor={`menu-res-${r}`}
            className="flex cursor-pointer select-none items-center gap-2 text-sm text-(--c-text-700)"
          >
            <Checkbox
              id={`menu-res-${r}`}
              checked={enabled}
              disabled={disabled || pending.has(r)}
              onChange={() => onToggle(r, enabled)}
            />
            {RESOURCE_LABELS[r]}
          </label>
        )
      })}
    </div>
  </div>
)

// ─── Main component ───────────────────────────────────────────────────────────

export const ResourcesMenu = ({ selectedUsers }: { selectedUsers: User[] }) => {
  const queryClient = useQueryClient()
  const ids = selectedUsers.map(u => u.id)
  const noSelection = selectedUsers.length === 0

  const [pendingResources, setPendingResources] = useState<Set<ResourceKey>>(new Set())
  const [totalInput, setTotalInput] = useState(() => getCommonLimit(selectedUsers, 'total_limit'))
  const [jobInput, setJobInput] = useState(() => getCommonLimit(selectedUsers, 'job_limit'))

  useEffect(() => {
    setTotalInput(getCommonLimit(selectedUsers, 'total_limit'))
    setJobInput(getCommonLimit(selectedUsers, 'job_limit'))
  }, [selectedUsers])

  const allEnabled = areAllEnabled(selectedUsers)

  const toggleAllMutation = useMutation({
    mutationKey: ['toggle-all-resources'],
    mutationFn: () => (allEnabled ? bulkDisableAllResources(ids) : bulkEnableAllResources(ids)),
    onSuccess: () => {
      toastSuccess('Resources updated')
      invalidateQueries(queryClient)
    },
    onError: (e: AxiosError<BackendError>) => handleError(e, 'Failed to update resources'),
  })

  const totalLimitMutation = useMutation({
    mutationKey: ['set-total-limit-menu'],
    mutationFn: () => setTotalLimit(ids, parseFloat(totalInput)),
    onSuccess: () => {
      toastSuccess(`Total limit set to $${totalInput}`)
      invalidateQueries(queryClient)
    },
    onError: (e: AxiosError<BackendError>) => handleError(e, 'Failed to set total limit'),
  })

  const jobLimitMutation = useMutation({
    mutationKey: ['set-job-limit-menu'],
    mutationFn: () => setJobLimit(ids, parseFloat(jobInput)),
    onSuccess: () => {
      toastSuccess(`Job limit set to $${jobInput}`)
      invalidateQueries(queryClient)
    },
    onError: (e: AxiosError<BackendError>) => handleError(e, 'Failed to set job limit'),
  })

  const toggleResource = async (resource: ResourceKey, currentlyEnabled: boolean) => {
    setPendingResources(prev => new Set([...prev, resource]))
    try {
      if (currentlyEnabled) {
        await bulkDisableResource(ids, resource)
      } else {
        await bulkEnableResource(ids, resource)
      }
      toastSuccess('Resource updated')
      invalidateQueries(queryClient)
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
    <Menu
      disableInitialFocus
      trigger={
        <Menu.Trigger>
          {/* @ts-expect-error ref mismatch between Trigger and Button */}
          <Button as="div" data-variant="primary" data-testid="admin-users-resource-button" disabled={noSelection}>
            Cloud Resources
            <ChevronDown size={14} />
          </Button>
        </Menu.Trigger>
      }
    >
      {/* Popup is sized by its content; this wrapper sets the width and caps height */}
      <div style={{ width: 480, maxHeight: 'calc(var(--available-height, 80vh) - 16px)', overflowY: 'auto' }}>
        {/* ── Limits ── */}
        <div className="px-2 pb-1">
          <div className="mb-1 text-[11px] font-semibold tracking-widest text-(--c-text-400) uppercase">Limits</div>
          <LimitRow
            label="Total limit"
            value={totalInput}
            onChange={setTotalInput}
            onApply={() => void totalLimitMutation.mutateAsync()}
            disabled={
              noSelection ||
              totalLimitMutation.isPending ||
              Number.isNaN(parseFloat(totalInput)) ||
              parseFloat(totalInput) < 0
            }
          />
          <LimitRow
            label="Job limit"
            value={jobInput}
            onChange={setJobInput}
            onApply={() => void jobLimitMutation.mutateAsync()}
            disabled={
              noSelection ||
              jobLimitMutation.isPending ||
              Number.isNaN(parseFloat(jobInput)) ||
              parseFloat(jobInput) < 0
            }
          />
        </div>

        <div className="my-1 h-px bg-(--tertiary-200)" />

        {/* ── Resources header with "All" toggle ── */}
        <div className="flex items-center justify-between px-2 pb-2 pt-1">
          <label
            htmlFor="menu-res-all"
            className="flex cursor-pointer select-none items-center gap-1.5 text-xs text-(--c-text-500)"
          >
            <Checkbox
              id="menu-res-all"
              checked={allEnabled}
              disabled={noSelection || toggleAllMutation.isPending}
              onChange={() => void toggleAllMutation.mutateAsync()}
            />
            All
          </label>
        </div>
        {/* ── Compute ── */}
        <ResourceGroup
          groupLabel="Compute instances"
          resources={COMPUTE_RESOURCES}
          users={selectedUsers}
          pending={pendingResources}
          disabled={noSelection}
          onToggle={toggleResource}
        />

        <div className="my-1 h-px bg-(--tertiary-200)" />

        {/* ── Database ── */}
        <ResourceGroup
          groupLabel="Database instances"
          resources={DATABASE_RESOURCES}
          users={selectedUsers}
          pending={pendingResources}
          disabled={noSelection}
          onToggle={toggleResource}
        />
      </div>
    </Menu>
  )
}
