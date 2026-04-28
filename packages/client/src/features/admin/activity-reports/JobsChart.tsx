import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Loader } from '@/components/Loader'
import { ACTIVITY_REPORT_GC_TIME_MS, ACTIVITY_REPORT_STALE_TIME_MS, fetchMetric } from './api'

interface JobsChartProps {
  dateFrom: string
  dateTo: string
}

export function JobsChart({ dateFrom, dateTo }: JobsChartProps) {
  const jobRunQuery = useQuery({
    queryKey: ['activity-report', 'jobRun', dateFrom, dateTo],
    queryFn: () => fetchMetric('jobRun', dateFrom, dateTo),
    staleTime: ACTIVITY_REPORT_STALE_TIME_MS,
    gcTime: ACTIVITY_REPORT_GC_TIME_MS,
  })

  const jobFailedQuery = useQuery({
    queryKey: ['activity-report', 'jobFailed', dateFrom, dateTo],
    queryFn: () => fetchMetric('jobFailed', dateFrom, dateTo),
    staleTime: ACTIVITY_REPORT_STALE_TIME_MS,
    gcTime: ACTIVITY_REPORT_GC_TIME_MS,
  })

  const isLoading = jobRunQuery.isLoading || jobFailedQuery.isLoading
  const isError = jobRunQuery.isError || jobFailedQuery.isError

  const runData = jobRunQuery.data?.data ?? []
  const failedData = jobFailedQuery.data?.data ?? []

  const failedMap = new Map(failedData)
  const chartData = runData.map(([ts, value]) => ({
    timestamp: ts,
    jobRun: value,
    jobFailed: failedMap.get(ts) ?? 0,
  }))

  return (
    <div className="col-span-full rounded-lg border border-(--c-layout-border) bg-background p-4 shadow-[0_1px_3px_0_var(--base-opacity-06),0_1px_2px_0_var(--base-opacity-06)]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-(--c-text-500)">Jobs Run / Failed</span>
      </div>

      <div className="h-[220px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader height={20} />
          </div>
        ) : isError ? (
          <div className="flex h-full items-center justify-center text-sm text-(--c-text-400)">Failed to load data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradient-job-run" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary-400)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary-400)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gradient-job-failed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--warning-400)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--warning-400)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--c-layout-border)" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={ts => format(new Date(ts), 'MMM d')}
                tick={{ fontSize: 11, fill: 'var(--c-text-400)' }}
                axisLine={{ stroke: 'var(--c-layout-border)' }}
                tickLine={false}
                minTickGap={30}
              />
              <YAxis tick={{ fontSize: 11, fill: 'var(--c-text-400)' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                labelFormatter={ts => format(new Date(ts as number), 'MMM d, yyyy HH:mm')}
                contentStyle={{
                  background: 'var(--background)',
                  border: '1px solid var(--c-layout-border)',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area
                type="monotone"
                dataKey="jobRun"
                name="Job Run"
                stroke="var(--primary-400)"
                strokeWidth={2}
                fill="url(#gradient-job-run)"
              />
              <Area
                type="monotone"
                dataKey="jobFailed"
                name="Job Failed"
                stroke="var(--warning-400)"
                strokeWidth={2}
                fill="url(#gradient-job-failed)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
