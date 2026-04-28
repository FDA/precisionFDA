import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Loader } from '@/components/Loader'

interface ActivityReportSectionProps {
  title: string
  icon: LucideIcon
  children: ReactNode
  footer?: ReactNode
}

export function ActivityReportSection({ title, icon: Icon, children, footer }: ActivityReportSectionProps) {
  return (
    <div className="rounded-lg border border-(--c-layout-border) bg-(--background)">
      <div className="border-b border-(--c-layout-border) px-5 py-3">
        <h3 className="m-0 flex items-center gap-2 text-sm font-semibold tracking-wide text-(--c-text-500) uppercase">
          <Icon size={16} />
          {title}
        </h3>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{children}</div>

        {footer && <div className="mt-5 flex flex-wrap justify-center gap-5">{footer}</div>}
      </div>
    </div>
  )
}

type StatCardTintSource = 'delta' | 'currentValue'

interface StatCardProps {
  label: string
  value: string | number
  /** Vs prior period of equal length (current − previous); used for footer + delta-based tint. */
  previousDelta?: number | null
  previousComparisonLoading?: boolean
  /**
   * `delta` (default): green/red from change vs previous range.
   * `currentValue`: green/red from the signed headline (for net metrics where negative is meaningful).
   */
  tintSource?: StatCardTintSource
  /** Required when tintSource is `currentValue` (raw number behind `value`). */
  currentValue?: number
}

export function StatCard({
  label,
  value,
  previousDelta,
  previousComparisonLoading = false,
  tintSource = 'delta',
  currentValue,
}: StatCardProps) {
  const showComparison = previousComparisonLoading || previousDelta != null

  let trendShell = 'border-(--c-layout-border)'

  if (tintSource === 'currentValue' && currentValue != null && !Number.isNaN(currentValue)) {
    if (currentValue > 0) {
      trendShell = 'border-[var(--success-200)] bg-[var(--success-50)]'
    } else if (currentValue < 0) {
      trendShell = 'border-[var(--warning-200)] bg-[var(--warning-50)]'
    }
  } else if (tintSource === 'delta' && previousDelta != null && !previousComparisonLoading) {
    if (previousDelta > 0) {
      trendShell = 'border-[var(--success-200)] bg-[var(--success-50)]'
    } else if (previousDelta < 0) {
      trendShell = 'border-[var(--warning-200)] bg-[var(--warning-50)]'
    }
  }

  return (
    <div
      className={`rounded-lg border px-8 py-6 text-center uppercase shadow-[0_1px_2px_0_var(--base-opacity-06)] transition-[background-color,border-color] duration-200 ${trendShell}`}
    >
      <div className="text-[28px] leading-none font-bold text-(--c-text-700)">{value}</div>
      <div className="mt-2 text-xs font-medium text-(--c-text-400)">{label}</div>
      {showComparison && (
        <div className="mt-2 flex min-h-[14px] justify-center text-xs font-medium normal-case text-(--c-text-400)">
          {previousComparisonLoading ? <Loader height={14} /> : <span>from previous range</span>}
        </div>
      )}
    </div>
  )
}
