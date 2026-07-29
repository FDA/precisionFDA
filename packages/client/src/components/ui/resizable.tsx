import * as React from 'react'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { cn } from '@/utils/cn'

type Orientation = 'horizontal' | 'vertical'

type ResizablePanelGroupProps = React.ComponentProps<'div'> & {
  orientation?: Orientation
}

type ResizablePanelProps = React.ComponentProps<'div'> & {
  /** Percentage string (e.g. `"50%"`) or number treated as percent. */
  defaultSize?: number | string
  /** Percentage string (e.g. `"20%"`) or number treated as percent. */
  minSize?: number | string
}

type ResizableHandleProps = React.ComponentProps<'div'> & {
  withHandle?: boolean
}

function parsePercent(value: number | string | undefined, fallback: number): number {
  if (value == null) return fallback
  if (typeof value === 'number') return value
  const parsed = Number.parseFloat(String(value).replace('%', ''))
  return Number.isFinite(parsed) ? parsed : fallback
}

function isPanelElement(child: React.ReactNode): child is React.ReactElement<ResizablePanelProps> {
  if (!React.isValidElement(child)) return false
  const type = child.type
  if (type === ResizablePanel) return true
  return typeof type === 'function' && 'displayName' in type && type.displayName === 'ResizablePanel'
}

function isHandleElement(child: React.ReactNode): child is React.ReactElement<ResizableHandleProps> {
  if (!React.isValidElement(child)) return false
  const type = child.type
  if (type === ResizableHandle) return true
  return typeof type === 'function' && 'displayName' in type && type.displayName === 'ResizableHandle'
}

function ResizablePanel({ className, defaultSize: _defaultSize, minSize: _minSize, ...props }: ResizablePanelProps) {
  return (
    <div data-slot="resizable-panel" className={cn('h-full min-h-0 min-w-0 overflow-hidden', className)} {...props} />
  )
}
ResizablePanel.displayName = 'ResizablePanel'

/**
 * Drag handle: thin border line that turns primary (blue) on
 * hover / focus / drag. Uses theme tokens so light and dark mode stay in sync.
 *
 * Compatible surface with shadcn/`react-resizable-panels`.
 */
function ResizableHandle({ withHandle, className, ...props }: ResizableHandleProps) {
  return (
    // Window splitter: div + role="separator" matches shadcn/react-resizable-panels.
    // biome-ignore lint/a11y/useSemanticElements: vertical splitter is not an <hr>
    <div
      data-slot="resizable-handle"
      role="separator"
      tabIndex={0}
      aria-valuenow={0}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        'relative z-10 flex w-1.5 shrink-0 items-center justify-center bg-transparent transition-colors',
        // Visible 1px rule centered in a wider hit target
        'before:absolute before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2 before:bg-border before:transition-colors',
        'hover:before:bg-primary focus-visible:before:bg-primary data-[separator=active]:before:bg-primary',
        'focus-visible:outline-hidden',
        'aria-[orientation=horizontal]:h-1.5 aria-[orientation=horizontal]:w-full',
        'aria-[orientation=horizontal]:before:inset-x-0 aria-[orientation=horizontal]:before:top-1/2',
        'aria-[orientation=horizontal]:before:h-px aria-[orientation=horizontal]:before:w-auto',
        'aria-[orientation=horizontal]:before:left-0 aria-[orientation=horizontal]:before:translate-x-0',
        'aria-[orientation=horizontal]:before:-translate-y-1/2',
        'max-md:hidden',
        className,
      )}
      {...props}
    >
      {withHandle && <div className="z-10 flex h-6 w-1 shrink-0 rounded-lg bg-border" />}
    </div>
  )
}
ResizableHandle.displayName = 'ResizableHandle'

function ResizablePanelGroup({ orientation = 'horizontal', className, children, ...props }: ResizablePanelGroupProps) {
  const groupRef = useRef<HTMLDivElement>(null)
  const sizesRef = useRef<number[]>([])
  const dragSessionRef = useRef<{
    handlePanelIndex: number
    startPos: number
    startSizes: number[]
    span: number
  } | null>(null)
  const [sizes, setSizes] = useState<number[]>([])
  const [activeHandle, setActiveHandle] = useState<number | null>(null)

  const childList = React.Children.toArray(children)
  const panelCount = childList.filter(isPanelElement).length

  const panelConfigs = childList.filter(isPanelElement).map(child => ({
    defaultSize: parsePercent(child.props.defaultSize, 100 / Math.max(panelCount, 1)),
    minSize: parsePercent(child.props.minSize, 0),
  }))

  const syncSizesFromDefaults = useEffectEvent(() => {
    if (sizes.length === panelConfigs.length && sizes.length > 0) return
    const next = panelConfigs.map(p => p.defaultSize)
    sizesRef.current = next
    setSizes(next)
  })

  // Initialize sizes once from panel defaults (stable for a given panel count).
  useEffect(() => {
    syncSizesFromDefaults()
  }, [panelConfigs.length])

  sizesRef.current = sizes.length ? sizes : panelConfigs.map(p => p.defaultSize)
  const resolvedSizes = sizesRef.current
  const minSizes = panelConfigs.map(p => p.minSize)

  const onPointerMove = useEffectEvent((ev: PointerEvent) => {
    const session = dragSessionRef.current
    if (!session) return

    const { handlePanelIndex, startPos, startSizes, span } = session
    const currentPos = orientation === 'horizontal' ? ev.clientX : ev.clientY
    const deltaPct = ((currentPos - startPos) / span) * 100
    const minLeft = minSizes[handlePanelIndex] ?? 0
    const minRight = minSizes[handlePanelIndex + 1] ?? 0
    let left = startSizes[handlePanelIndex] + deltaPct
    let right = startSizes[handlePanelIndex + 1] - deltaPct

    if (left < minLeft) {
      right -= minLeft - left
      left = minLeft
    }
    if (right < minRight) {
      left -= minRight - right
      right = minRight
    }

    const next = [...startSizes]
    next[handlePanelIndex] = left
    next[handlePanelIndex + 1] = right
    sizesRef.current = next
    setSizes(next)
  })

  const endResize = useEffectEvent(() => {
    dragSessionRef.current = null
    setActiveHandle(null)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  })

  const startResize = useEffectEvent((handlePanelIndex: number, event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const group = groupRef.current
    if (!group) return

    const startPos = orientation === 'horizontal' ? event.clientX : event.clientY
    const startSizes = [...sizesRef.current]
    const rect = group.getBoundingClientRect()
    const span = orientation === 'horizontal' ? rect.width : rect.height
    if (span <= 0) return

    dragSessionRef.current = { handlePanelIndex, startPos, startSizes, span }
    setActiveHandle(handlePanelIndex)
    document.body.style.cursor = orientation === 'horizontal' ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'
  })

  useEffect(() => {
    if (activeHandle === null) return

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', endResize)
    window.addEventListener('pointercancel', endResize)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', endResize)
      window.removeEventListener('pointercancel', endResize)
    }
  }, [activeHandle])

  let panelCursor = 0
  const rendered = childList.map((child, childIndex) => {
    if (isPanelElement(child)) {
      const index = panelCursor
      panelCursor += 1
      const size = resolvedSizes[index] ?? panelConfigs[index]?.defaultSize ?? 50
      const { className: panelClassName, defaultSize: _d, minSize: _m, style, ...rest } = child.props

      return (
        <div
          key={child.key ?? `panel-${index}`}
          data-slot="resizable-panel"
          className={cn(
            'min-h-0 min-w-0 overflow-hidden',
            // Stacked (narrow): equal 50/50 height split, ignore desktop grow weights
            orientation === 'horizontal' &&
              'max-md:w-full! max-md:min-h-0! max-md:flex-1! max-md:basis-0! max-md:grow!',
            panelClassName,
          )}
          style={{
            // Grow weights share leftover space after the handle; more reliable than % flex-basis.
            flexGrow: size,
            flexShrink: 1,
            flexBasis: 0,
            ...style,
          }}
          {...rest}
        />
      )
    }

    if (isHandleElement(child)) {
      const handlePanelIndex = panelCursor - 1
      const { className: handleClassName, onPointerDown, withHandle, ...rest } = child.props
      const ariaOrientation = orientation === 'horizontal' ? 'vertical' : 'horizontal'

      return (
        <ResizableHandle
          key={child.key ?? `handle-${childIndex}`}
          {...rest}
          aria-orientation={ariaOrientation}
          aria-label={rest['aria-label'] ?? 'Resize panels'}
          aria-valuenow={Math.round(resolvedSizes[handlePanelIndex] ?? 0)}
          aria-valuemin={Math.round(minSizes[handlePanelIndex] ?? 0)}
          aria-valuemax={Math.round(100 - (minSizes[handlePanelIndex + 1] ?? 0))}
          data-separator={activeHandle === handlePanelIndex ? 'active' : undefined}
          withHandle={withHandle}
          className={cn(
            orientation === 'horizontal' ? 'cursor-col-resize touch-none' : 'cursor-row-resize touch-none',
            handleClassName,
          )}
          onPointerDown={event => {
            onPointerDown?.(event)
            if (event.defaultPrevented) return
            startResize(handlePanelIndex, event)
          }}
        />
      )
    }

    return child
  })

  return (
    <div
      ref={groupRef}
      data-slot="resizable-panel-group"
      data-orientation={orientation}
      className={cn(
        'flex h-full w-full min-w-0',
        orientation === 'vertical' && 'flex-col',
        orientation === 'horizontal' && 'max-md:flex-col',
        className,
      )}
      {...props}
    >
      {rendered}
    </div>
  )
}
ResizablePanelGroup.displayName = 'ResizablePanelGroup'

export type { ResizableHandleProps, ResizablePanelGroupProps, ResizablePanelProps }
export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
