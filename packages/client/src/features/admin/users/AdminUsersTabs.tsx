import { Tabs } from '@base-ui/react/tabs'
import { ExternalLink } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'

type AdminUsersTabValue = 'users' | 'invitations' | 'pending' | 'admins'

const tabClassName =
  'inline-flex h-9 cursor-pointer items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-(--primary-300) disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-(--background) data-[active]:text-(--c-text-700) data-[active]:shadow-[0_1px_2px_0_var(--base-opacity-06)]'

const getTabValueFromPath = (pathname: string): AdminUsersTabValue => {
  if (pathname.startsWith('/account/admin/users/invitations')) return 'invitations'
  if (pathname.startsWith('/account/admin/users/pending')) return 'pending'
  if (pathname.startsWith('/admin/admin_memberships')) return 'admins'
  return 'users'
}

export const AdminUsersTabs = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const onValueChange = (value: AdminUsersTabValue | null) => {
    if (value == null) return

    if (value === 'admins') {
      window.open('/admin/admin_memberships?group=site', '_blank', 'noopener,noreferrer')
      return
    }

    const pathByTab: Record<Exclude<AdminUsersTabValue, 'admins'>, string> = {
      users: '/account/admin/users',
      invitations: '/account/admin/users/invitations',
      pending: '/account/admin/users/pending',
    }
    navigate(pathByTab[value])
  }

  return (
    <div className="px-8">
      <Tabs.Root
        value={getTabValueFromPath(location.pathname)}
        onValueChange={value => onValueChange(value as AdminUsersTabValue)}
      >
        <Tabs.List className="inline-flex h-10 items-center justify-center rounded-lg bg-(--background-shaded-100) p-1 text-(--c-text-500)">
          <Tabs.Tab value="users" className={tabClassName}>
            Users list
          </Tabs.Tab>
          <Tabs.Tab value="invitations" className={tabClassName}>
            Invitations list
          </Tabs.Tab>
          <Tabs.Tab value="pending" className={tabClassName}>
            Pending users list
          </Tabs.Tab>
          <Tabs.Tab value="admins" className={tabClassName}>
            <span className="inline-flex items-center gap-1.5">
              Admins list
              <ExternalLink size={14} aria-hidden="true" />
            </span>
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.Root>
    </div>
  )
}
