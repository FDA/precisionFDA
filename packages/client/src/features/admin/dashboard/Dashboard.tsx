import { useQuery } from '@tanstack/react-query'
import { Building2, FileText, LayoutGrid, Users } from 'lucide-react'
import { useState } from 'react'
import { UserLayout } from '@/layouts/UserLayout'
import { cn } from '@/utils/cn'
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
      icon: Users,
      iconColor: 'text-blue-500',
      bgTint: 'bg-blue-500/10',
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
      icon: LayoutGrid,
      iconColor: 'text-emerald-500',
      bgTint: 'bg-emerald-500/10',
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
      icon: FileText,
      iconColor: 'text-amber-500',
      bgTint: 'bg-amber-500/10',
    },
  ]

  return (
    <UserLayout mainScroll>
      <div className="flex flex-col gap-8 p-8">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="m-0 text-sm text-muted-foreground">Manage and monitor precisionFDA</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(stat => (
            <div
              key={stat.key}
              className="rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                <div className={cn('flex size-9 items-center justify-center rounded-lg', stat.bgTint)}>
                  <stat.icon className={cn('size-5', stat.iconColor)} />
                </div>
              </div>
              {isLoading ? (
                <div className="mb-4 h-9 w-20 animate-pulse rounded-md bg-muted" />
              ) : (
                <div className="mb-4 text-3xl font-bold tracking-tight text-foreground">
                  {stat.total.toLocaleString()}
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-emerald-500" key={`${stat.key}-${stat.period}`}>
                  {stat.periodValue.toLocaleString()} new {stat.periodValue === 1 ? stat.singular : stat.plural}
                </span>
                <div className="flex gap-1">
                  {PERIODS.map(period => (
                    <button
                      type="button"
                      key={period}
                      className={cn(
                        'rounded-md border px-2 py-1 text-[10px] font-medium transition-colors',
                        stat.period === period
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-secondary text-muted-foreground hover:bg-accent',
                      )}
                      onClick={() => stat.setPeriod(period)}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Organizations</span>
              <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10">
                <Building2 className="size-5 text-violet-500" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
            ) : (
              <div className="text-3xl font-bold tracking-tight text-foreground">{data.orgsCount.toLocaleString()}</div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  )
}
