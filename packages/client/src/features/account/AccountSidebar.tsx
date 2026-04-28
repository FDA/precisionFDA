import clsx from 'clsx'
import {
  AlertTriangle,
  Bell,
  Boxes,
  ChartBar,
  Cloud,
  Command,
  ExternalLink,
  FileText,
  Landmark,
  LayoutDashboard,
  Newspaper,
  Settings,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router'
import { KeyIcon } from '@/components/icons/KeyIcon'
import { ObjectGroupIcon } from '@/components/icons/ObjectGroupIcon'
import { useAuthUser } from '../auth/useAuthUser'
import styles from './AccountSidebar.module.css'

export const AccountSidebar = ({ onItemClick }: { onItemClick?: () => void }) => {
  const user = useAuthUser()
  const isAdmin = user?.can_administer_site
  const displayName = user?.full_name?.trim() ? user.full_name : user?.dxuser

  const navItems = [
    { to: '/account/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/account/cloud-resources', icon: Cloud, label: 'Cloud Resources' },
    { to: '/account/notifications', icon: Bell, label: 'Notification Settings' },
    { to: '/account/settings', icon: Settings, label: 'Account Settings' },
    { href: '/licenses', icon: FileText, label: 'Manage Licenses' },
    { to: '/account/api-keys', icon: KeyIcon, label: 'API Keys' },
  ]

  const adminNavItems = [
    { to: '/account/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/account/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/org_action_requests', icon: Landmark, label: 'Org Requests' },
    { to: '/account/admin/spaces', icon: ObjectGroupIcon, label: 'Spaces' },
    { to: '/account/admin/news', icon: Newspaper, label: 'News' },
    { to: '/account/admin/activity-reports', icon: ChartBar, label: 'Activity Reports' },
    { href: '/admin/comparator_settings', icon: Boxes, label: 'Comparator Settings' },
    { to: '/account/admin/alerts', icon: AlertTriangle, label: 'Site Alerts' },
  ]

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Command size={16} />
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>{displayName}</span>
            <span className={styles.logoSubtitle}>Account</span>
          </div>
        </div>
      </div>

      <nav className={styles.nav}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Account</h3>
          <ul className={styles.list}>
            {navItems.map(item => (
              <li key={item.to ?? item.href}>
                {item.to ? (
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => clsx(styles.link, isActive && styles.active)}
                    onClick={onItemClick}
                  >
                    <item.icon className={styles.icon} size={18} />
                    {item.label}
                  </NavLink>
                ) : (
                  <a href={item.href} target="_blank" rel="noreferrer" className={styles.link} onClick={onItemClick}>
                    <item.icon className={styles.icon} size={18} />
                    {item.label}
                    <ExternalLink className={styles.externalLinkIcon} size={12} />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {isAdmin && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Admin</h3>
            <ul className={styles.list}>
              {adminNavItems.map(item => (
                <li key={item.to ?? item.href}>
                  {item.to ? (
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) => clsx(styles.link, isActive && styles.active)}
                      onClick={onItemClick}
                    >
                      <item.icon className={styles.icon} size={18} />
                      {item.label}
                    </NavLink>
                  ) : (
                    <a href={item.href} target="_blank" rel="noreferrer" className={styles.link} onClick={onItemClick}>
                      <item.icon className={styles.icon} size={18} />
                      {item.label}
                      <ExternalLink className={styles.externalLinkIcon} size={12} />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </aside>
  )
}
