import { cn } from '@/utils/cn'

const DOT_SIZE_RATIO = 0.5
const DOT_GAP_RATIO = 0.6
const DOT_ANIMATION_DELAY_SECONDS = 0.16

type LoaderProps = {
  /** Overall height in px. Dot size and spacing scale from this. */
  height?: number
  className?: string
  /** Flow inline with surrounding text instead of as a centered block. */
  inline?: boolean
  /** Accessible status text announced to assistive technology. */
  label?: string
  /** Add top padding when used as a full-page / section loader. */
  pageloader?: boolean
}

export const Loader = ({ height = 16, className, inline, label = 'Loading', pageloader }: LoaderProps) => {
  const dotSize = Math.max(4, Math.round(height * DOT_SIZE_RATIO))

  return (
    <span
      role="status"
      style={{ gap: dotSize * DOT_GAP_RATIO }}
      className={cn(
        inline ? 'inline-flex align-middle' : 'flex',
        'items-center justify-center text-legacy-base',
        pageloader && 'pt-4',
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          aria-hidden
          className="animate-loader-dot rounded-full bg-current"
          style={{ width: dotSize, height: dotSize, animationDelay: `${i * DOT_ANIMATION_DELAY_SECONDS}s` }}
        />
      ))}
    </span>
  )
}
