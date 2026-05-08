import { Tabs } from '@base-ui/react/tabs'
import { Link, useLocation } from 'react-router'

const TABS = [
  { value: 'users', label: 'Users', path: '/account/admin/users' },
  { value: 'invitations', label: 'Invitations', path: '/account/admin/users/invitations' },
  { value: 'pending', label: 'Pending users', path: '/account/admin/users/pending' },
  { value: 'memberships', label: 'Admin Memberships', path: '/account/admin/users/memberships' },
] as const

type AdminUsersTabValue = (typeof TABS)[number]['value']

const tabClassName =
  'inline-flex h-9 cursor-pointer items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors no-underline outline-none focus-visible:ring-2 focus-visible:ring-(--primary-300) disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-(--background) data-[active]:text-(--c-text-700) data-[active]:shadow-[0_1px_2px_0_var(--base-opacity-06)]'

const matchTab = (pathname: string): AdminUsersTabValue =>
  [...TABS].reverse().find(tab => pathname.startsWith(tab.path))?.value ?? 'users'

export const AdminUsersTabs = () => {
  const { pathname } = useLocation()

  return (
    <div className="px-8 pt-4">
      <Tabs.Root value={matchTab(pathname)}>
        <Tabs.List className="inline-flex h-10 items-center justify-center rounded-lg bg-(--background-shaded-100) p-1 text-(--c-text-500)">
          {TABS.map(tab => (
            <Tabs.Tab
              key={tab.value}
              value={tab.value}
              className={tabClassName}
              nativeButton={false}
              render={<Link to={tab.path} />}
            >
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.Root>
    </div>
  )
}
