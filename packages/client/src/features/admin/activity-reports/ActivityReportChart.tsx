import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Loader } from '@/components/Loader'
import { ACTIVITY_REPORT_GC_TIME_MS, ACTIVITY_REPORT_STALE_TIME_MS, fetchMetric } from './api'
import type { ActivityMetricType } from './api'
import { formatBytes, formatNumber } from './format'

interface ActivityReportChartProps {
  label: string
  endpoint: ActivityMetricType
  dateFrom: string
  dateTo: string
  formatAsBytes?: boolean
  color?: string
}

export function ActivityReportChart({
  label,
  endpoint,
  dateFrom,
  dateTo,
  formatAsBytes = false,
  color = 'var(--primary-400)',
}: ActivityReportChartProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['activity-report', endpoint, dateFrom, dateTo],
    queryFn: () => fetchMetric(endpoint, dateFrom, dateTo),
    staleTime: ACTIVITY_REPORT_STALE_TIME_MS,
    gcTime: ACTIVITY_REPORT_GC_TIME_MS,
  })

  const chartData = (data?.data ?? []).map(([ts, value]) => ({
    timestamp: ts,
    value,
  }))

  const totalDisplay = data ? (formatAsBytes ? formatBytes(data.total) : formatNumber(data.total)) : '--'

  const formatValue = formatAsBytes ? formatBytes : formatNumber

  return (
    <div className="rounded-lg border border-(--c-layout-border) bg-background p-4 shadow-[0_1px_3px_0_var(--base-opacity-06),0_1px_2px_0_var(--base-opacity-06)]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-(--c-text-500)">{label}</span>
        <span className="text-sm font-bold text-(--c-text-700)">
          {isLoading ? <Loader height={14} /> : totalDisplay}
        </span>
      </div>

      <div className="h-45">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader height={20} />
          </div>
        ) : isError ? (
          <div className="flex h-full items-center justify-center text-sm text-(--c-text-400)">Failed to load data</div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-(--c-text-400)">No data available</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${endpoint}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.05} />
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
              <YAxis
                tickFormatter={v => (formatAsBytes ? formatBytes(v) : v.toLocaleString())}
                tick={{ fontSize: 11, fill: 'var(--c-text-400)' }}
                axisLine={false}
                tickLine={false}
                width={formatAsBytes ? 60 : 40}
              />
              <Tooltip
                labelFormatter={ts => format(new Date(ts as number), 'MMM d, yyyy HH:mm')}
                formatter={value => {
                  const numericValue = typeof value === 'number' ? value : Number(value ?? 0)
                  return [formatValue(numericValue), label]
                }}
                contentStyle={{
                  background: 'var(--background)',
                  border: '1px solid var(--c-layout-border)',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${endpoint})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
