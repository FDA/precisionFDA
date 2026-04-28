import clsx from 'clsx'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Outlet } from 'react-router'
import { UserLayout } from '@/layouts/UserLayout'
import styles from './AccountLayout.module.css'
import { AccountSidebar } from './AccountSidebar'

export const AccountLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.mobileHeader}>
          <button
            type="button"
            className={styles.mobileTrigger}
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <span className={styles.mobileTitle}>Account</span>
        </div>

        {isSidebarOpen && <div className={styles.overlay} onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />}

        <div className={clsx(styles.sidebarWrapper, isSidebarOpen && styles.open)}>
          <AccountSidebar onItemClick={() => setIsSidebarOpen(false)} />
        </div>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </UserLayout>
  )
}
