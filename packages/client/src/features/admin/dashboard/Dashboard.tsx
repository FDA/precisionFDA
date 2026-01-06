import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { UserLayout } from '../../../layouts/UserLayout'
import { AdminIcon } from '../../../components/icons/AdminIcon'
import { UsersIcon } from '../../../components/icons/UsersIcon'
import { BullsEyeIcon } from '../../../components/icons/BullsEyeIcon'
import { ChartColumnIcon } from '../../../components/icons/ChartColumnIcon'
import { BellIcon } from '../../../components/icons/BellIcon'
import { HandshakeIcon } from '../../../components/icons/HandshakeIcon'
import { ChartLineIcon } from '../../../components/icons/ChartLineIcon'
import { NewspaperIcon } from '../../../components/icons/NewspaperIcon'
import { Loader } from '../../../components/Loader'
import { fetchAdminStats } from '../users/api'
import { ObjectGroupIcon } from '../../../components/icons/ObjectGroupIcon'
import { FileIcon } from '../../../components/icons/FileIcon'
import styles from './dashboard.module.css'

const PERIODS = ['1M', '6M', 'YTD', '1Y']

export function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => fetchAdminStats(),
    initialData: {
      usersCount: { total: 0, lastMonth: 0, lastSixMonths: 0, yearToDate: 0, lastYear: 0 },
      spacesCount: { total: 0, lastMonth: 0, lastSixMonths: 0, yearToDate: 0, lastYear: 0 },
      filesCount: { total: 0, lastMonth: 0, lastSixMonths: 0, yearToDate: 0, lastYear: 0 },
      orgsCount: 0,
    },
  })

  const navigate = useNavigate()

  const [usersPeriod, setUsersPeriod] = useState('1M')
  const [spacesPeriod, setSpacesPeriod] = useState('1M')
  const [filesPeriod, setFilesPeriod] = useState('1M')

  const getPeriodCount = (
    countData: { lastMonth?: number; lastSixMonths?: number; yearToDate?: number; lastYear?: number },
    period: string,
  ) => {
    switch (period) {
      case '1M':
        return countData.lastMonth || 0
      case '6M':
        return countData.lastSixMonths || 0
      case 'YTD':
        return countData.yearToDate || 0
      case '1Y':
        return countData.lastYear || 0
      default:
        return 0
    }
  }

  const usersCount = getPeriodCount(data.usersCount, usersPeriod)
  const spacesCount = getPeriodCount(data.spacesCount, spacesPeriod)
  const filesCount = getPeriodCount(data.filesCount, filesPeriod)

  return (
    <UserLayout mainScroll>
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <div className={styles.headerTop}>
            <ChartColumnIcon height={32} />
            <h1 className={styles.title}>Admin Dashboard</h1>
          </div>
          <p className={styles.subtitle}>Manage and monitor precisionFDA</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.statLabel}>Total Active Users</div>
              <div className={styles.statIconWrapper}>
                <UsersIcon height={18} />
              </div>
            </div>
            <div className={styles.statValue}>{isLoading ? <Loader height={20} /> : data.usersCount.total.toLocaleString()}</div>
            <div className={styles.statFooter}>
              <div className={styles.statChange} key={`users-${usersPeriod}`}>
                {usersCount.toLocaleString()} new {usersCount === 1 ? 'user' : 'users'}
              </div>
              <div className={styles.periodSelector}>
                {PERIODS.map(period => (
                  <button
                    key={period}
                    className={`${styles.periodButton} ${usersPeriod === period ? styles.active : ''}`}
                    onClick={() => setUsersPeriod(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.statLabel}>Total Active Spaces</div>
              <div className={styles.statIconWrapper}>
                <ObjectGroupIcon height={18} />
              </div>
            </div>
            <div className={styles.statValue}>{isLoading ? <Loader height={20} /> : data.spacesCount.total.toLocaleString()}</div>
            <div className={styles.statFooter}>
              <div className={styles.statChange} key={`spaces-${spacesPeriod}`}>
                {spacesCount.toLocaleString()} new {spacesCount === 1 ? 'space' : 'spaces'}
              </div>
              <div className={styles.periodSelector}>
                {PERIODS.map(period => (
                  <button
                    key={period}
                    className={`${styles.periodButton} ${spacesPeriod === period ? styles.active : ''}`}
                    onClick={() => setSpacesPeriod(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.statLabel}>Total Files</div>
              <div className={styles.statIconWrapper}>
                <FileIcon height={18} />
              </div>
            </div>
            <div className={styles.statValue}>{isLoading ? <Loader height={20} /> : data.filesCount.total.toLocaleString()}</div>
            <div className={styles.statFooter}>
              <div className={styles.statChange} key={`files-${filesPeriod}`}>
                {filesCount.toLocaleString()} new {filesCount === 1 ? 'file' : 'files'}
              </div>
              <div className={styles.periodSelector}>
                {PERIODS.map(period => (
                  <button
                    key={period}
                    className={`${styles.periodButton} ${filesPeriod === period ? styles.active : ''}`}
                    onClick={() => setFilesPeriod(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.statLabel}>Total Organizations</div>
              <div className={styles.statIconWrapper}>
                <UsersIcon height={18} />
              </div>
            </div>
            <div className={styles.statValue}>{isLoading ? <Loader height={20} /> : data.orgsCount.toLocaleString()}</div>
            <div className={styles.statFooter}></div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIconWrapper}>
              <AdminIcon height={25} />
            </div>
            <h1 className={styles.title}>Site Administration</h1>
          </div>
          <div className={styles.actionGrid}>
            <button className={styles.actionButton} onClick={() => navigate('/admin/users')}>
              <div className={styles.actionIcon}>
                <UsersIcon height={22} />
              </div>
              <div className={styles.actionLabel}>Users</div>
            </button>
            <button
              className={styles.actionButton}
              onClick={() => (window.location.href = '/admin/admin_memberships?group=site')}
            >
              <div className={styles.actionIcon}>
                <AdminIcon height={22} />
              </div>
              <div className={styles.actionLabel}>Admins</div>
            </button>
            <button className={styles.actionButton} onClick={() => navigate('/admin/spaces')}>
              <div className={styles.actionIcon}>
                <ObjectGroupIcon height={22} />
              </div>
              <div className={styles.actionLabel}>Spaces</div>
            </button>
            <button className={styles.actionButton} onClick={() => navigate('/admin/users/pending')}>
              <div className={styles.actionIcon}>
                <UsersIcon height={22} />
              </div>
              <div className={styles.actionLabel}>Pending Users</div>
            </button>
            <button className={styles.actionButton} onClick={() => (window.location.href = '/admin/org_action_requests')}>
              <div className={styles.actionIcon}>
                <UsersIcon height={22} />
              </div>
              <div className={styles.actionLabel}>Org Requests</div>
            </button>
            <button className={styles.actionButton} onClick={() => navigate('/admin/alerts')}>
              <div className={styles.actionIcon}>
                <BellIcon height={22} />
              </div>
              <div className={styles.actionLabel}>Site Alerts</div>
            </button>
            <button className={styles.actionButton} onClick={() => (window.location.href = '/admin/activity_reports')}>
              <div className={styles.actionIcon}>
                <ChartLineIcon height={22} />
              </div>
              <div className={styles.actionLabel}>Activity Reports</div>
            </button>
            <button className={styles.actionButton} onClick={() => navigate('/admin/news')}>
              <div className={styles.actionIcon}>
                <NewspaperIcon height={22} />
              </div>
              <div className={styles.actionLabel}>News</div>
            </button>
            <button className={styles.actionButton} onClick={() => (window.location.href = '/admin/participants')}>
              <div className={styles.actionIcon}>
                <HandshakeIcon height={22} />
              </div>
              <div className={styles.actionLabel}>Participants</div>
            </button>
            <button className={styles.actionButton} onClick={() => (window.location.href = '/admin/sidekiq')}>
              <div className={styles.actionIcon}>
                <ChartColumnIcon height={22} />
              </div>
              <div className={styles.actionLabel}>Sidekiq</div>
            </button>
            <button className={styles.actionButton} onClick={() => (window.location.href = '/admin/comparator_settings')}>
              <div className={styles.actionIcon}>
                <BullsEyeIcon height={22} />
              </div>
              <div className={styles.actionLabel}>Comparator Settings</div>
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}
