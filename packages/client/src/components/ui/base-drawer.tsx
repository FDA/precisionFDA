import { Drawer } from '@base-ui/react/drawer'
import { X } from 'lucide-react'
import type React from 'react'

type BaseDrawerProps = {
  open: boolean
  onClose: () => void
  header: React.ReactNode
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export const BaseDrawer = ({
  open,
  onClose,
  header,
  description = 'Panel details.',
  children,
  footer,
}: BaseDrawerProps) => (
  <Drawer.Root open={open} onOpenChange={(nextOpen: boolean) => !nextOpen && onClose()} swipeDirection="right">
    <Drawer.Portal keepMounted>
      <Drawer.Backdrop className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 data-closed:opacity-0 data-starting-style:opacity-0 data-ending-style:opacity-0" />
      <Drawer.Viewport className="fixed inset-0 z-50">
        <Drawer.Popup className="fixed inset-y-0 right-0 z-50 flex w-full max-w-150 outline-none transition-transform duration-200 ease-out data-closed:translate-x-full data-starting-style:translate-x-full data-ending-style:translate-x-full">
          <Drawer.Content className="flex h-full w-full flex-col overflow-hidden border-l border-(--tertiary-250) bg-background shadow-[-16px_0_48px_rgba(0,0,0,0.16)] outline-none">
            <Drawer.Description className="sr-only">{description}</Drawer.Description>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-(--tertiary-250) px-5 py-4">
              <div className="min-w-0">{header}</div>
              <Drawer.Close
                aria-label="Close"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded text-(--c-text-500) transition-colors hover:bg-(--background-shaded-100) hover:text-(--c-text-700)"
              >
                <X size={16} aria-hidden="true" />
              </Drawer.Close>
            </div>

            {/* Scrollable body */}
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            {footer}
          </Drawer.Content>
        </Drawer.Popup>
      </Drawer.Viewport>
    </Drawer.Portal>
  </Drawer.Root>
)
