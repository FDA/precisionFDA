import { useQuery } from '@tanstack/react-query'
import {
  differenceInCalendarDays,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subHours,
} from 'date-fns'
import { BarChart3, Cpu, Database, Trophy, Users } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { Loader } from '@/components/Loader'
import { usePageMeta } from '@/hooks/usePageMeta'
import { ActivityReportChart } from './ActivityReportChart'
import { ActivityReportSection, StatCard } from './ActivityReportSection'
import type { DateRangePreset } from './activity-reports.types'
import { ACTIVITY_REPORT_GC_TIME_MS, ACTIVITY_REPORT_STALE_TIME_MS, fetchActivityTotals } from './api'
import { DatePicker } from './DatePicker'
import { formatBytes, formatRuntime } from './format'
import { JobsChart } from './JobsChart'

function getDateRange(preset: DateRangePreset): { dateFrom: Date; dateTo: Date } {
  const now = new Date()
  switch (preset) {
    case 'day':
      return { dateFrom: subHours(now, 24), dateTo: now }
    case 'week':
      return { dateFrom: startOfWeek(now), dateTo: now }
    case 'month':
      return { dateFrom: startOfMonth(now), dateTo: now }
    case 'year':
      return { dateFrom: startOfYear(now), dateTo: now }
  }
}

const PRESETS: { key: DateRangePreset; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
]

function isDateRangePreset(value: string | null): value is DateRangePreset {
  return value === 'day' || value === 'week' || value === 'month' || value === 'year'
}

/** Same-length period immediately before [dateFrom, dateTo] (inclusive calendar days). */
function getPreviousDateRange(dateFrom: string, dateTo: string): { dateFrom: string; dateTo: string } | null {
  if (!dateFrom.trim() || !dateTo.trim()) return null
  const start = parseISO(dateFrom)
  const end = parseISO(dateTo)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
  const inclusiveDays = differenceInCalendarDays(end, start) + 1
  if (inclusiveDays < 1) return null
  const prevEnd = subDays(start, 1)
  const prevStart = subDays(prevEnd, inclusiveDays - 1)
  return {
    dateFrom: format(prevStart, 'yyyy-MM-dd'),
    dateTo: format(prevEnd, 'yyyy-MM-dd'),
  }
}

export function ActivityReportsPage() {
  usePageMeta({ title: 'precisionFDA Admin - Site Activity Report' })

  const [searchParams, setSearchParams] = useSearchParams()

  const presetFromUrl = searchParams.get('preset')
  const activePreset = isDateRangePreset(presetFromUrl) ? presetFromUrl : null
  const customDateFrom = searchParams.get('dateFrom') ?? ''
  const customDateTo = searchParams.get('dateTo') ?? ''

  useEffect(() => {
    const hasAnyFilter = searchParams.has('preset') || searchParams.has('dateFrom') || searchParams.has('dateTo')
    if (!hasAnyFilter) {
      const nextParams = new URLSearchParams(searchParams.toString())
      nextParams.set('preset', 'week')
      setSearchParams(nextParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const { dateFrom, dateTo } = useMemo(() => {
    if (activePreset) {
      const range = getDateRange(activePreset)
      return {
        dateFrom: format(range.dateFrom, 'yyyy-MM-dd'),
        dateTo: format(range.dateTo, 'yyyy-MM-dd'),
      }
    }
    if (customDateFrom || customDateTo) {
      return { dateFrom: customDateFrom, dateTo: customDateTo }
    }

    const fallbackRange = getDateRange('week')
    return {
      dateFrom: format(fallbackRange.dateFrom, 'yyyy-MM-dd'),
      dateTo: format(fallbackRange.dateTo, 'yyyy-MM-dd'),
    }
  }, [activePreset, customDateFrom, customDateTo])

  const previousRange = useMemo(() => getPreviousDateRange(dateFrom, dateTo), [dateFrom, dateTo])

  const totalsQuery = useQuery({
    queryKey: ['activity-report-totals', dateFrom, dateTo],
    queryFn: () => fetchActivityTotals(dateFrom, dateTo),
    enabled: Boolean(dateFrom && dateTo),
    staleTime: ACTIVITY_REPORT_STALE_TIME_MS,
    gcTime: ACTIVITY_REPORT_GC_TIME_MS,
  })

  const previousTotalsQuery = useQuery({
    queryKey: ['activity-report-totals', previousRange?.dateFrom, previousRange?.dateTo],
    queryFn: () => {
      if (previousRange == null) {
        throw new Error('Previous range is required')
      }
      return fetchActivityTotals(previousRange.dateFrom, previousRange.dateTo)
    },
    enabled: previousRange != null,
    staleTime: ACTIVITY_REPORT_STALE_TIME_MS,
    gcTime: ACTIVITY_REPORT_GC_TIME_MS,
  })

  const comparisonLoading = previousRange != null && previousTotalsQuery.isLoading
  const previousTotals = previousTotalsQuery.data

  const handlePresetClick = (preset: DateRangePreset) => {
    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.set('preset', preset)
    nextParams.delete('dateFrom')
    nextParams.delete('dateTo')
    setSearchParams(nextParams)
  }

  const presetBtnBase =
    'cursor-pointer rounded border border-(--c-layout-border) bg-(--background-shaded) px-3 py-1.5 text-xs font-medium text-(--c-text-500) transition-colors duration-200 hover:bg-(--c-dropdown-hover-bg)'
  const presetBtnActive = 'border-(--primary-400) bg-(--primary-400) !text-white hover:bg-(--primary-500)'

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <BarChart3 size={24} className="text-(--primary-500)" />
          <h1 className="m-0 text-2xl font-bold text-(--c-text-700)">Site Activity Report</h1>
        </div>
        <p className="m-0 text-sm text-(--c-text-500)">
          Track platform activity across users, data, apps, and challenges
        </p>
      </div>

      {/* Date Range Toolbar */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {PRESETS.map(preset => (
            <button
              key={preset.key}
              type="button"
              className={`${presetBtnBase} ${activePreset === preset.key ? presetBtnActive : ''}`}
              onClick={() => handlePresetClick(preset.key)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <DatePicker
            value={activePreset ? dateFrom : customDateFrom}
            onChange={val => {
              const nextParams = new URLSearchParams(searchParams.toString())
              nextParams.delete('preset')
              if (val) {
                nextParams.set('dateFrom', val)
              } else {
                nextParams.delete('dateFrom')
              }
              setSearchParams(nextParams)
            }}
            placeholder="Start date"
          />
          <span className="text-xs text-(--c-text-400)">to</span>
          <DatePicker
            value={activePreset ? dateTo : customDateTo}
            onChange={val => {
              const nextParams = new URLSearchParams(searchParams.toString())
              nextParams.delete('preset')
              if (val) {
                nextParams.set('dateTo', val)
              } else {
                nextParams.delete('dateTo')
              }
              setSearchParams(nextParams)
            }}
            placeholder="End date"
          />
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-8">
        {/* Users Section */}
        <ActivityReportSection title="Users" icon={Users}>
          <ActivityReportChart
            label="Views"
            endpoint="userViewed"
            dateFrom={dateFrom}
            dateTo={dateTo}
            color="var(--primary-400)"
          />
          <ActivityReportChart
            label="Access Requests"
            endpoint="userAccessRequested"
            dateFrom={dateFrom}
            dateTo={dateTo}
            color="var(--primary-400)"
          />
          <ActivityReportChart
            label="User Logins"
            endpoint="userLoggedIn"
            dateFrom={dateFrom}
            dateTo={dateTo}
            color="var(--primary-400)"
          />
        </ActivityReportSection>

        {/* Data Section */}
        <ActivityReportSection
          title="Data"
          icon={Database}
          footer={
            totalsQuery.isLoading ? (
              <Loader height={16} />
            ) : totalsQuery.data ? (
              <>
                <StatCard
                  label="Net data storage"
                  value={formatBytes(totalsQuery.data.dataStorage)}
                  tintSource="currentValue"
                  currentValue={totalsQuery.data.dataStorage}
                  previousComparisonLoading={comparisonLoading}
                  previousDelta={
                    previousTotals != null ? totalsQuery.data.dataStorage - previousTotals.dataStorage : undefined
                  }
                />
                <StatCard
                  label="Net files"
                  value={totalsQuery.data.numberOfFiles.toLocaleString()}
                  tintSource="currentValue"
                  currentValue={totalsQuery.data.numberOfFiles}
                  previousComparisonLoading={comparisonLoading}
                  previousDelta={
                    previousTotals != null ? totalsQuery.data.numberOfFiles - previousTotals.numberOfFiles : undefined
                  }
                />
              </>
            ) : null
          }
        >
          <ActivityReportChart
            label="Data Upload"
            endpoint="dataUpload"
            dateFrom={dateFrom}
            dateTo={dateTo}
            formatAsBytes
            color="var(--success-400)"
          />
          <ActivityReportChart
            label="Data Download"
            endpoint="dataDownload"
            dateFrom={dateFrom}
            dateTo={dateTo}
            formatAsBytes
            color="var(--success-400)"
          />
          <ActivityReportChart
            label="Data Generated"
            endpoint="dataGenerated"
            dateFrom={dateFrom}
            dateTo={dateTo}
            formatAsBytes
            color="var(--success-400)"
          />
        </ActivityReportSection>

        {/* Apps Section */}
        <ActivityReportSection
          title="Apps"
          icon={Cpu}
          footer={
            totalsQuery.isLoading ? (
              <Loader height={16} />
            ) : totalsQuery.data ? (
              <>
                <StatCard
                  label="Apps created"
                  value={totalsQuery.data.apps.toLocaleString()}
                  previousComparisonLoading={comparisonLoading}
                  previousDelta={previousTotals != null ? totalsQuery.data.apps - previousTotals.apps : undefined}
                />
                <StatCard
                  label="Apps published"
                  value={totalsQuery.data.publicApps.toLocaleString()}
                  previousComparisonLoading={comparisonLoading}
                  previousDelta={
                    previousTotals != null ? totalsQuery.data.publicApps - previousTotals.publicApps : undefined
                  }
                />
                <StatCard
                  label="Job runtime"
                  value={formatRuntime(totalsQuery.data.runtime)}
                  previousComparisonLoading={comparisonLoading}
                  previousDelta={previousTotals != null ? totalsQuery.data.runtime - previousTotals.runtime : undefined}
                />
              </>
            ) : null
          }
        >
          <ActivityReportChart
            label="Apps Created"
            endpoint="appCreated"
            dateFrom={dateFrom}
            dateTo={dateTo}
            color="var(--highlight-400)"
          />
          <ActivityReportChart
            label="Apps Published"
            endpoint="appPublished"
            dateFrom={dateFrom}
            dateTo={dateTo}
            color="var(--highlight-400)"
          />
          <ActivityReportChart
            label="Apps Run"
            endpoint="appRun"
            dateFrom={dateFrom}
            dateTo={dateTo}
            color="var(--highlight-400)"
          />
          <JobsChart dateFrom={dateFrom} dateTo={dateTo} />
        </ActivityReportSection>

        {/* Challenges Section */}
        <ActivityReportSection title="Challenges" icon={Trophy}>
          <ActivityReportChart
            label="Challenge Signups"
            endpoint="usersSignedUpForChallenge"
            dateFrom={dateFrom}
            dateTo={dateTo}
            color="var(--purple-400)"
          />
          <ActivityReportChart
            label="Submissions"
            endpoint="submissionsCreated"
            dateFrom={dateFrom}
            dateTo={dateTo}
            color="var(--purple-400)"
          />
        </ActivityReportSection>
      </div>
    </div>
  )
}
