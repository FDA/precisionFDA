export type FilterChip = {
  key: string | number
  label: string
  count?: number
  active: boolean
  onClick: () => void
}

type FilterChipsProps = {
  chips: FilterChip[]
  className?: string
  'aria-label'?: string
}

const baseClass =
  'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] leading-none tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-(--background) focus-visible:ring-(--c-text-500)'

const inactiveClass =
  'border-(--c-layout-border-200) bg-transparent text-(--c-text-500) hover:bg-(--tertiary-100) hover:text-(--c-text-700)'

const activeClass = 'border-transparent bg-(--tertiary-700) text-(--tertiary-50) font-semibold'

export function FilterChips({ chips, className, 'aria-label': ariaLabel }: FilterChipsProps) {
  return (
    <div role="toolbar" aria-label={ariaLabel} className={`flex flex-wrap items-center gap-1.5 ${className ?? ''}`}>
      {chips.map(chip => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onClick}
          aria-pressed={chip.active}
          className={`${baseClass} ${chip.active ? activeClass : inactiveClass}`}
        >
          <span>{chip.label}</span>
          {chip.count !== undefined && (
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className={`h-3 w-px ${chip.active ? 'bg-(--tertiary-300)' : 'bg-(--c-layout-border-200)'}`}
              />
              <span
                className={`font-mono text-[10.5px] tabular-nums ${chip.active ? 'text-(--tertiary-100)' : 'text-(--c-text-400)'}`}
              >
                {chip.count}
              </span>
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
