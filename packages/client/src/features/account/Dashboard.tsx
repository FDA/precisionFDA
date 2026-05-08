import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
  Box,
  ChartBar,
  Database,
  FileArchive,
  FileText,
  type LucideIcon,
  MessagesSquare,
  Network,
  Zap,
} from 'lucide-react'
import { cn } from '@/utils/cn'

interface CountersResponse {
  apps: number
  assets: number
  dbclusters: number
  jobs: number
  files: number
  workflows: number
  reports: number
  discussions: number
}

interface StatCard {
  label: string
  value: number | undefined
  icon: LucideIcon
  iconColor: string
  bgTint: string
}

const fetchCounters = async (): Promise<CountersResponse> => {
  return axios.get('/api/v2/counters').then(d => d.data)
}

export const Dashboard = () => {
  const { data: counters, isLoading } = useQuery({
    queryKey: ['counters', 'me'],
    queryFn: fetchCounters,
  })

  const stats: StatCard[] = [
    {
      label: 'Private Files',
      value: counters?.files,
      icon: FileText,
      iconColor: 'text-blue-500',
      bgTint: 'bg-blue-500/10',
    },
    { label: 'Apps', value: counters?.apps, icon: Box, iconColor: 'text-emerald-500', bgTint: 'bg-emerald-500/10' },
    {
      label: 'Assets',
      value: counters?.assets,
      icon: FileArchive,
      iconColor: 'text-cyan-500',
      bgTint: 'bg-cyan-500/10',
    },
    { label: 'Executions', value: counters?.jobs, icon: Zap, iconColor: 'text-amber-500', bgTint: 'bg-amber-500/10' },
    {
      label: 'DB Clusters',
      value: counters?.dbclusters,
      icon: Database,
      iconColor: 'text-rose-500',
      bgTint: 'bg-rose-500/10',
    },
    {
      label: 'Workflows',
      value: counters?.workflows,
      icon: Network,
      iconColor: 'text-indigo-500',
      bgTint: 'bg-indigo-500/10',
    },
    {
      label: 'Reports',
      value: counters?.reports,
      icon: ChartBar,
      iconColor: 'text-orange-500',
      bgTint: 'bg-orange-500/10',
    },
    {
      label: 'Discussions',
      value: counters?.discussions,
      icon: MessagesSquare,
      iconColor: 'text-violet-500',
      bgTint: 'bg-violet-500/10',
    },
  ]

  return (
    <div className="flex flex-col gap-8 p-8">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              <div className={cn('flex size-9 items-center justify-center rounded-lg', stat.bgTint)}>
                <stat.icon className={cn('size-5', stat.iconColor)} />
              </div>
            </div>
            {isLoading ? (
              <div className="h-9 w-16 animate-pulse rounded-md bg-muted" />
            ) : (
              <div className="text-3xl font-bold tracking-tight text-foreground">{stat.value ?? 0}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
