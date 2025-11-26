import React from 'react'

import { Navigate, Route, Routes } from 'react-router-dom'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useAuthUser } from '../auth/useAuthUser'
import ListAdminNews from '../news/ListAdminNews'
import CreateNewsItemPage from '../news/form/CreateNewsItemPage'
import EditNewsItemPage from '../news/form/EditNewsItemPage'
import { AlertsPage } from './alerts/AlertsPage'
import { AdminDashboard } from './dashboard/Dashboard'
import { InvitationsList } from './invitations'
import { ProvisioningList } from './invitations/ProvisioningList'
import UsersList from './users'
import { SpacesList } from './spaces'

const Admin = () => {
  usePageMeta({ title: 'Admin Dashboard - precisionFDA' })

  // Admin check
  const user = useAuthUser()
  // Sometimes when coming back to the Dashboard using "Back" button,
  // the user variable is not loaded yet and therefore user (even though admin) was redirected to root
  // Once we get rid of Rails pages, we can adjust this condition to (!user?.isAdmin)
  if (user && !user.isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="/users" element={<UsersList />} />
      <Route path="/invitations" element={<InvitationsList />} />
      <Route path="/spaces" element={<SpacesList />} />
      <Route path="/invitations/provisioning" element={<ProvisioningList />} />
      <Route path="/news" element={<ListAdminNews />} />
      <Route path="/news/create" element={<CreateNewsItemPage />} />
      <Route path="/news/:id/edit" element={<EditNewsItemPage />} />
    </Routes>
  )
}

export default Admin
