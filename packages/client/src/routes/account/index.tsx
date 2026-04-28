import { Navigate, Outlet } from 'react-router'
import { AccountLayout } from '@/features/account/AccountLayout'
import { AccountSettings } from '@/features/account/AccountSettings'
import { ApiKeys } from '@/features/account/ApiKeys'
import { CloudResources } from '@/features/account/CloudResources'
import { Dashboard } from '@/features/account/Dashboard'
import { Licenses } from '@/features/account/Licenses'
import { ActivityReportsPage } from '@/features/admin/activity-reports/ActivityReportsPage'
import { AlertsPage } from '@/features/admin/alerts/AlertsPage'
import { AdminDashboard } from '@/features/admin/dashboard/Dashboard'
import { InvitationsList } from '@/features/admin/invitations'
import { ProvisioningList } from '@/features/admin/invitations/ProvisioningList'
import { SpacesList } from '@/features/admin/spaces'
import { AdminUsersLayout } from '@/features/admin/users/AdminUsersLayout'
import { useAuthUser } from '@/features/auth/useAuthUser'
import { LayoutLoader } from '@/layouts/UserLayout'
import PendingUsersList from '../../features/admin/pendingUsers'
import UsersList from '../../features/admin/users'
import CreateNewsItemPage from '../../features/news/form/CreateNewsItemPage'
import EditNewsItemPage from '../../features/news/form/EditNewsItemPage'
import ListAdminNews from '../../features/news/ListAdminNews'
import NotificationsPage from '../../pages/Account/Notifications'

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
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'cloud-resources', element: <CloudResources /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'settings', element: <AccountSettings /> },
      { path: 'licenses', element: <Licenses /> },
      { path: 'api-keys', element: <ApiKeys /> },
      {
        path: 'admin',
        element: <AdminRouteGuard />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'alerts', element: <AlertsPage /> },
          {
            path: 'users',
            element: <AdminUsersLayout />,
            children: [
              { index: true, element: <UsersList /> },
              { path: 'invitations', element: <InvitationsList /> },
              { path: 'invitations/provisioning', element: <ProvisioningList /> },
              { path: 'pending', element: <PendingUsersList /> },
            ],
          },
          { path: 'invitations', element: <Navigate to="../users/invitations" replace /> },
          { path: 'spaces', element: <SpacesList /> },
          { path: 'activity-reports', element: <ActivityReportsPage /> },
          { path: 'invitations/provisioning', element: <Navigate to="../users/invitations/provisioning" replace /> },
          { path: 'news', element: <ListAdminNews /> },
          { path: 'news/create', element: <CreateNewsItemPage /> },
          { path: 'news/:id/edit', element: <EditNewsItemPage /> },
        ],
      },
    ],
  },
]

export default accountRoutes
