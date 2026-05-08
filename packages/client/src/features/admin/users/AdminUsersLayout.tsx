import { Outlet } from 'react-router'
import { AdminUsersTabs } from './AdminUsersTabs'

export const AdminUsersLayout = () => {
  return (
    <>
      <AdminUsersTabs />
      <Outlet />
    </>
  )
}
