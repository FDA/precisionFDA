import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2 } from 'lucide-react'
import { FileIcon } from '../../../components/icons/FileIcon'
import { ObjectGroupIcon } from '../../../components/icons/ObjectGroupIcon'
import { UsersIcon } from '../../../components/icons/UsersIcon'
import { Loader } from '../../../components/Loader'
import { UserLayout } from '../../../layouts/UserLayout'
import { fetchAdminStats } from '../users/api'

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

  const statCardClassName =
    'rounded-lg border border-(--c-layout-border) bg-(--background) p-6 shadow-[0_1px_3px_0_var(--base-opacity-06),0_1px_2px_0_var(--base-opacity-06)]'
  const periodButtonBaseClassName =
    'cursor-pointer rounded border border-(--c-layout-border) bg-(--background-shaded) px-1.5 py-1 text-[10px] font-medium text-(--c-text-500) transition-colors duration-200 hover:bg-(--c-dropdown-hover-bg)'

  const stats = [
    {
      key: 'users',
      label: 'Total Active Users',
      total: data.usersCount.total,
      periodValue: usersCount,
      period: usersPeriod,
      setPeriod: setUsersPeriod,
      singular: 'user',
      plural: 'users',
      Icon: UsersIcon,
      iconClassName: 'text-(--primary-500)',
    },
    {
      key: 'spaces',
      label: 'Total Active Spaces',
      total: data.spacesCount.total,
      periodValue: spacesCount,
      period: spacesPeriod,
      setPeriod: setSpacesPeriod,
      singular: 'space',
      plural: 'spaces',
      Icon: ObjectGroupIcon,
      iconClassName: 'text-(--success-500)',
    },
    {
      key: 'files',
      label: 'Total Files',
      total: data.filesCount.total,
      periodValue: filesCount,
      period: filesPeriod,
      setPeriod: setFilesPeriod,
      singular: 'file',
      plural: 'files',
      Icon: FileIcon,
      iconClassName: 'text-(--highlight-500)',
    },
  ]

  return (
    <UserLayout mainScroll>
      <div className="px-8 py-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <h1 className="m-0 text-2xl font-bold text-(--c-text-700)">Admin Dashboard</h1>
          </div>
          <p className="m-0 text-sm text-(--c-text-500)">Manage and monitor precisionFDA</p>
        </div>

        <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
          {stats.map(stat => (
            <div key={stat.key} className={statCardClassName}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-(--c-text-500)">{stat.label}</span>
                <div className={stat.iconClassName}>
                  <stat.Icon height={20} />
                </div>
              </div>
              <div className="mb-4 text-[32px] leading-none font-bold text-(--c-text-700)">
                {isLoading ? <Loader height={20} /> : stat.total.toLocaleString()}
              </div>
              <div className="flex items-center justify-between gap-2">
                <div
                  className="text-[13px] whitespace-nowrap text-(--success-400) transition-all duration-300 ease-in-out"
                  key={`${stat.key}-${stat.period}`}
                >
                  {stat.periodValue.toLocaleString()} new {stat.periodValue === 1 ? stat.singular : stat.plural}
                </div>
                <div className="flex flex-wrap gap-1">
                  {PERIODS.map(period => (
                    <button
                      type="button"
                      key={period}
                      className={`${periodButtonBaseClassName} ${
                        stat.period === period
                          ? 'border-(--primary-400) bg-(--primary-400) !text-white hover:bg-(--primary-500)'
                          : ''
                      }`}
                      onClick={() => stat.setPeriod(period)}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className={statCardClassName}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-(--c-text-500)">Total Organizations</span>
              <Building2 size={20} className="text-(--purple-500)" />
            </div>
            <div className="text-[32px] leading-none font-bold text-(--c-text-700)">
              {isLoading ? <Loader height={20} /> : data.orgsCount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}
