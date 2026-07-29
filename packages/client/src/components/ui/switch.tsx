import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import { cn } from '@/utils/cn'

function Switch({ className, children, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-border/70 bg-muted p-0.5 shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:border-primary data-checked:bg-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-border dark:bg-input/60 dark:data-checked:border-primary dark:data-checked:bg-primary',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="size-4 rounded-full border border-border/60 bg-background shadow-sm transition-transform data-checked:translate-x-4" />
      {children}
    </SwitchPrimitive.Root>
  )
}

export { Switch }
