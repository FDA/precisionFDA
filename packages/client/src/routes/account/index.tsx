import React from 'react'
import { Navigate, Outlet } from 'react-router'
import { AccountLayout } from '@/features/account/AccountLayout'
import { useAuthUser } from '@/features/auth/useAuthUser'
import { LayoutLoader } from '@/layouts/UserLayout'

const AccountSettings = React.lazy(() =>
  import('@/features/account/AccountSettings').then(m => ({ default: m.AccountSettings })),
)
const ApiKeys = React.lazy(() => import('@/features/account/ApiKeys').then(m => ({ default: m.ApiKeys })))
const CloudResources = React.lazy(() =>
  import('@/features/account/CloudResources').then(m => ({ default: m.CloudResources })),
)
const Dashboard = React.lazy(() => import('@/features/account/Dashboard').then(m => ({ default: m.Dashboard })))
const Licenses = React.lazy(() => import('@/features/account/Licenses').then(m => ({ default: m.Licenses })))
const ActivityReportsPage = React.lazy(() =>
  import('@/features/admin/activity-reports/ActivityReportsPage').then(m => ({
    default: m.ActivityReportsPage,
  })),
)
const AlertsPage = React.lazy(() => import('@/features/admin/alerts/AlertsPage').then(m => ({ default: m.AlertsPage })))
const AdminDashboard = React.lazy(() =>
  import('@/features/admin/dashboard/Dashboard').then(m => ({ default: m.AdminDashboard })),
)
const InvitationsList = React.lazy(() =>
  import('@/features/admin/invitations').then(m => ({ default: m.InvitationsList })),
)
const ProvisioningList = React.lazy(() =>
  import('@/features/admin/invitations/ProvisioningList').then(m => ({
    default: m.ProvisioningList,
  })),
)
const AdminMembershipsPage = React.lazy(() => import('@/features/admin/memberships'))
const SpacesList = React.lazy(() => import('@/features/admin/spaces').then(m => ({ default: m.SpacesList })))
const AdminUsersLayout = React.lazy(() =>
  import('@/features/admin/users/AdminUsersLayout').then(m => ({ default: m.AdminUsersLayout })),
)
const PendingUsersList = React.lazy(() => import('../../features/admin/pendingUsers'))
const UsersList = React.lazy(() => import('../../features/admin/users'))
const CreateNewsItemPage = React.lazy(() => import('../../features/news/form/CreateNewsItemPage'))
const EditNewsItemPage = React.lazy(() => import('../../features/news/form/EditNewsItemPage'))
const ListAdminNews = React.lazy(() => import('../../features/news/ListAdminNews'))
const NotificationsPage = React.lazy(() => import('../../pages/Account/Notifications'))

const AdminRouteGuard = () => {
  const { user, loading } = useAuthUser(true)

  if (loading) {
    return <LayoutLoader />
  }

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

const accountRoutes = [
  {
    element: <AccountLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', Component: Dashboard },
      { path: 'cloud-resources', Component: CloudResources },
      { path: 'notifications', Component: NotificationsPage },
      { path: 'settings', Component: AccountSettings },
      { path: 'licenses', Component: Licenses },
      { path: 'api-keys', Component: ApiKeys },
      {
        path: 'admin',
        element: <AdminRouteGuard />,
        children: [
          { index: true, Component: AdminDashboard },
          { path: 'alerts', Component: AlertsPage },
          {
            path: 'users',
            Component: AdminUsersLayout,
            children: [
              { index: true, Component: UsersList },
              { path: 'invitations', Component: InvitationsList },
              { path: 'invitations/provisioning', Component: ProvisioningList },
              { path: 'pending', Component: PendingUsersList },
              { path: 'memberships', Component: AdminMembershipsPage },
            ],
          },
          { path: 'invitations', element: <Navigate to="../users/invitations" replace /> },
          { path: 'spaces', Component: SpacesList },
          { path: 'activity-reports', Component: ActivityReportsPage },
          { path: 'invitations/provisioning', element: <Navigate to="../users/invitations/provisioning" replace /> },
          { path: 'news', Component: ListAdminNews },
          { path: 'news/create', Component: CreateNewsItemPage },
          { path: 'news/:id/edit', Component: EditNewsItemPage },
        ],
      },
    ],
  },
]

export default accountRoutes
