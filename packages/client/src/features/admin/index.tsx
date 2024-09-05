import React from 'react'

import { Navigate, Route, Routes } from 'react-router-dom'
import { usePageMeta } from '../../hooks/usePageMeta'
import { AlertsPage } from './alerts/AlertsPage'
import { AdminDashboard } from './dashboard/Dashboard'
import UsersList from './users'
import ListAdminNews from '../news/ListAdminNews'
import CreateNewsItemPage from '../news/form/CreateNewsItemPage'
import EditNewsItemPage from '../news/form/EditNewsItemPage'
import { useAuthUser } from '../auth/useAuthUser'

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
      <Route path="/news" element={<ListAdminNews />} />
      <Route path="/news/create" element={<CreateNewsItemPage />} />
      <Route path="/news/:id/edit" element={<EditNewsItemPage />} />
    </Routes>
  )
}

export default Admin