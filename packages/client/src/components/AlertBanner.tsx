import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { alertTypesText } from '../features/admin/alerts/alerts.common'
import type { AlertType } from '../features/admin/alerts/alerts.types'
import { TransparentButton } from './Button'

const alertBannerRoot = (variant: AlertType) =>
  cn(
    'site-alert-banner box-border flex h-site-alert justify-between gap-4 px-8 py-0.5 text-[13px]',
    variant === 'warning' ? 'bg-[#e73a3a] text-white' : 'bg-[#f0c250] text-[hsl(0_0%_20%)]',
  )

export const AlertBanner = ({
  variant,
  alertText,
  dismissAlert,
}: {
  variant: AlertType
  alertText?: string
  dismissAlert: () => void
}) => {
  if (!alertText) return null

  return (
    <div className={alertBannerRoot(variant)} data-variant={variant}>
      <div className="flex flex-1 justify-center text-pretty">
        <span className="mr-2 font-bold capitalize">{alertTypesText[variant]}:</span> {alertText}
      </div>
      <TransparentButton
        type="button"
        className="mt-0.5 flex cursor-pointer items-center justify-center self-start"
        onClick={dismissAlert}
        aria-label="Dismiss alert"
      >
        <X height={14} />
      </TransparentButton>
    </div>
  )
}
