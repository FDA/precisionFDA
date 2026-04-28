import { Outlet } from 'react-router'
import { AdminUsersTabs } from './AdminUsersTabs'

export const AdminUsersLayout = () => {
  return (
    <>
      <div className="pt-4">
        <AdminUsersTabs />
      </div>
      <Outlet />
    </>
  )
}
