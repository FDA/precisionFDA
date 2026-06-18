import { Dialog } from '@base-ui/react/dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import type React from 'react'
import { cn } from '@/utils/cn'
import styles from './Modal.module.css'

// ---------------------------------------------------------------------------
// Modal (root) — wraps Base UI Dialog.Root / Portal / Backdrop / Popup
// ---------------------------------------------------------------------------

const modalContentVariants = cva(
  'relative flex flex-col bg-[var(--background)] shadow-lg rounded-lg border border-[var(--c-modal-border,transparent)] min-w-[300px] max-w-[1000px] w-auto outline-none max-h-[90vh] overflow-hidden',
  {
    variants: {
      variant: {
        large: 'w-[min(80%,1000px)] h-[min(80vh,800px)] max-h-[700px]',
        medium: 'w-[min(80%,800px)]',
        small: 'w-[min(80%,400px)]',
      },
    },
  },
)

export interface ModalProps extends VariantProps<typeof modalContentVariants> {
  isShown: boolean
  hide: () => void
  id: string
  headerText: string
  blur?: boolean
  zIndex?: number
  children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({
  isShown,
  hide,
  id,
  headerText,
  variant,
  blur = false,
  zIndex,
  children,
}) => (
  <Dialog.Root
    open={isShown}
    onOpenChange={open => {
      if (!open) hide()
    }}
  >
    <Dialog.Portal>
      <Dialog.Backdrop
        className={cn('fixed inset-0 z-[500] bg-black/30', blur && 'backdrop-blur-sm', styles.backdrop)}
        style={zIndex ? { zIndex } : undefined}
      />
      <Dialog.Popup
        id={id}
        aria-label={headerText}
        className={cn('fixed inset-0 z-[500] flex items-center justify-center p-4', styles.popup)}
        style={zIndex ? { zIndex } : undefined}
      >
        <div className={cn(modalContentVariants({ variant }), '[--modal-padding-LR:1.5rem] [--modal-padding-TB:1rem]')}>
          {children}
        </div>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
)

// ---------------------------------------------------------------------------
// HeaderTop
// ---------------------------------------------------------------------------

export interface HeaderTopProps {
  className?: string
  children: React.ReactNode
}

export const HeaderTop: React.FC<HeaderTopProps> = ({ className, children }) => (
  <div
    className={cn(
      'flex items-center justify-between rounded-t-lg border-b border-[var(--c-layout-border)] px-[var(--modal-padding-LR,1.5rem)] py-[var(--modal-padding-TB,1rem)]',
      className,
    )}
  >
    {children}
  </div>
)

// ---------------------------------------------------------------------------
// HeaderText — wraps Base UI Dialog.Title
// ---------------------------------------------------------------------------

export interface HeaderTextProps {
  className?: string
  children: React.ReactNode
}

export const HeaderText: React.FC<HeaderTextProps> = ({ className, children }) => (
  <Dialog.Title className={cn('min-w-0 flex-1 self-center text-lg font-semibold', className)}>{children}</Dialog.Title>
)

// ---------------------------------------------------------------------------
// ModalHeaderTop
// ---------------------------------------------------------------------------

export interface ModalHeaderTopProps {
  hide?: () => void
  headerText: string
  disableClose?: boolean
}

export const ModalHeaderTop: React.FC<ModalHeaderTopProps> = ({ hide, headerText, disableClose = false }) => (
  <HeaderTop>
    <HeaderText>{headerText}</HeaderText>
    {!disableClose && <CloseButton onClick={hide} />}
  </HeaderTop>
)

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

export interface FooterProps {
  className?: string
  children: React.ReactNode
}

export const Footer: React.FC<FooterProps> = ({ className, children }) => (
  <div className={cn('flex items-center justify-end gap-2 border-t border-[var(--c-layout-border)] p-4', className)}>
    {children}
  </div>
)

// ---------------------------------------------------------------------------
// CloseButton — wraps Base UI Dialog.Close
// ---------------------------------------------------------------------------

export interface CloseButtonProps {
  onClick?: () => void
  className?: string
}

export const CloseButton: React.FC<CloseButtonProps> = ({ onClick, className }) => (
  <Dialog.Close
    data-testid="modal-close-button"
    onClick={onClick}
    className={cn(
      'inline-flex cursor-pointer items-center justify-center self-start rounded-sm border-none bg-transparent p-1 text-[var(--c-text-600)] transition-colors hover:bg-[var(--tertiary-70)] hover:text-[var(--c-text-900)]',
      className,
    )}
  >
    <X className="size-4" />
  </Dialog.Close>
)

// ---------------------------------------------------------------------------
// ModalPageCol
// ---------------------------------------------------------------------------

export interface ModalPageColProps {
  className?: string
  children: React.ReactNode
}

export const ModalPageCol: React.FC<ModalPageColProps> = ({ className, children }) => (
  <div
    className={cn(
      'h-full min-w-[350px] shrink-0 grow self-stretch border-r border-[var(--c-layout-border-200)] last:border-0',
      className,
    )}
  >
    {children}
  </div>
)

// ---------------------------------------------------------------------------
// ScrollPlace
// ---------------------------------------------------------------------------

export interface ScrollPlaceProps {
  className?: string
  children: React.ReactNode
}

export const ScrollPlace: React.FC<ScrollPlaceProps> = ({ className, children }) => (
  <div className={cn('scrollbar-thin max-h-[50vh] min-h-[50vh] overflow-y-auto', className)}>{children}</div>
)

// ---------------------------------------------------------------------------
// ModalPageRow
// ---------------------------------------------------------------------------

export interface ModalPageRowProps {
  className?: string
  children: React.ReactNode
}

export const ModalPageRow: React.FC<ModalPageRowProps> = ({ className, children }) => (
  <div className={cn('grid flex-1 grid-cols-[auto_auto]', className)}>{children}</div>
)

// ---------------------------------------------------------------------------
// ModalScrollAutoHeight
// ---------------------------------------------------------------------------

export interface ModalScrollAutoHeightProps {
  className?: string
  children: React.ReactNode
}

export const ModalScrollAutoHeight: React.FC<ModalScrollAutoHeightProps> = ({ className, children }) => (
  <div className={cn('scrollbar-thin flex-1 overflow-y-scroll', className)}>{children}</div>
)
