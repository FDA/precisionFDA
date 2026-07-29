import { Drawer } from '@base-ui/react/drawer'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink } from 'lucide-react'
import type React from 'react'
import { BaseDrawer } from '@/components/ui/base-drawer'
import type { UserState } from '@/types/user'
import { relativeTimeAgo } from '@/utils/datetime'
import { formatDate } from '@/utils/formatting'
import { fetchUserById } from './api'
import type { UserDetails } from './types'

export type UserDetailsDrawerProps = {
  userId: number | null
  open: boolean
  onClose: () => void
}

export const statusLabel: Record<UserState, string> = {
  active: 'Active',
  deactivated: 'Deactivated',
  locked: 'Locked',
  'n/a': 'N/A',
}

export const statusClassName: Record<UserState, string> = {
  active: 'bg-(--success-100) text-(--success-700)',
  deactivated: 'bg-(--highlight-100) text-(--highlight-800)',
  locked: 'bg-(--warning-100) text-(--warning-700)',
  'n/a': 'bg-(--tertiary-100) text-(--tertiary-500)',
}

const formatDateTime = (value: string | null) => (value ? formatDate(value) : 'N/A')

// ─── Shared layout primitives ────────────────────────────────────────────────

export const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-3 py-1.5">
    <dt className="w-40 shrink-0 text-sm text-(--c-text-600)">{label}</dt>
    <dd className="min-w-0 flex-1 text-sm break-words text-(--c-text-700)">{children}</dd>
  </div>
)

export const SectionHeading = ({ title }: { title: string }) => (
  <div className="flex items-center gap-2 pt-5 pb-2 first:pt-0">
    <span className="whitespace-nowrap text-[11px] font-semibold tracking-widest text-(--c-text-400) uppercase">
      {title}
    </span>
    <div className="h-px flex-1 bg-(--tertiary-250)" />
  </div>
)

export const YesNoBadge = ({ value }: { value: boolean }) => (
  <span
    className={`inline-flex w-8 items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium ${
      value ? 'bg-(--success-100) text-(--success-700)' : 'bg-(--warning-100) text-(--warning-700)'
    }`}
  >
    {value ? 'Yes' : 'No'}
  </span>
)

export const StatusBadge = ({ state }: { state: UserState }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClassName[state]}`}>
    {statusLabel[state]}
  </span>
)

// ─── Drawer body ─────────────────────────────────────────────────────────────

type DrawerBodyProps = {
  details: UserDetails
}

export const UserAccount = ({ details }: DrawerBodyProps) => {
  return (
    <>
      <SectionHeading title="Account" />
      <Row label="Full name">{details.fullName}</Row>
      <Row label="Username">@{details.dxuser}</Row>
      <Row label="Email">{details.email}</Row>
      <Row label="Status">
        <StatusBadge state={details.userState} />
      </Row>
      <Row label="Single sign-on">
        <YesNoBadge value={!!details.isSSO} />
      </Row>
      <Row label="Joined">{formatDateTime(details.createdAt)}</Row>
      {!!details.lastLogin && (
        <Row label="Last login">
          {formatDateTime(details.lastLogin)}
          {relativeTimeAgo(details.lastLogin) ? (
            <span className="ml-1.5 text-xs text-(--c-text-400)">({relativeTimeAgo(details.lastLogin)})</span>
          ) : null}
        </Row>
      )}
      <Row label="Last updated">{formatDateTime(details.updatedAt)}</Row>
      <Row label="Timezone">{details.timeZone ?? 'N/A'}</Row>
    </>
  )
}

export const UserOrganization = ({ details }: DrawerBodyProps) => {
  return (
    <>
      <SectionHeading title="Organization" />
      <Row label="Name">{details.organization.name}</Row>
      <Row label="Handle">{details.organization.handle}</Row>
      <Row label="Admin">{details.organization.adminFullName ?? 'N/A'}</Row>
      <Row label="Type">{details.organization.singular ? 'Single-user' : 'Multi-user'}</Row>
    </>
  )
}

// ─── Standalone basic content (reusable outside drawer) ──────────────────────

export const UserBasicContent = ({ user }: { user: UserDetails }) => {
  return (
    <dl className="px-5 py-4">
      <UserAccount details={user} />
      <UserOrganization details={user} />
    </dl>
  )
}

// ─── Drawer header ───────────────────────────────────────────────────────────

type UserDrawerHeaderProps = {
  fullName?: string
  dxuser?: string
  userState?: UserState
  userId?: number | null
}

export const UserDrawerHeader = ({ fullName, dxuser, userState, userId }: UserDrawerHeaderProps) => (
  <>
    <div className="flex items-center gap-2">
      <Drawer.Title className="truncate text-base font-semibold text-(--c-text-700)">
        {fullName ?? 'User details'}
      </Drawer.Title>
      {userId != null && dxuser && (
        <a
          href={`/users/${dxuser}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Open user details in new tab"
          className="inline-flex items-center text-(--c-text-400) hover:text-(--c-text-700)"
        >
          <ExternalLink size={13} aria-hidden="true" />
        </a>
      )}
    </div>
    <div className="mt-1 flex flex-wrap items-center gap-2">
      {dxuser ? <span className="text-xs text-(--c-text-400)">@{dxuser}</span> : null}
      {userState ? <StatusBadge state={userState} /> : null}
    </div>
  </>
)

// ─── Drawer root ─────────────────────────────────────────────────────────────

export const UserDetailsDrawer = ({ userId, open, onClose }: UserDetailsDrawerProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUserById(userId as number),
    enabled: open && userId != null,
    refetchOnWindowFocus: false,
  })

  return (
    <BaseDrawer
      open={open}
      onClose={onClose}
      header={
        <UserDrawerHeader fullName={data?.fullName} dxuser={data?.dxuser} userState={data?.userState} userId={userId} />
      }
      description="User account details."
    >
      {isLoading ? <div className="px-5 py-4 text-sm text-(--c-text-400)">Loading…</div> : null}
      {!isLoading && error ? (
        <div className="px-5 py-4 text-sm text-(--warning-600)">Failed to load user details.</div>
      ) : null}
      {!isLoading && !error && data ? <UserBasicContent user={data} /> : null}
    </BaseDrawer>
  )
}
