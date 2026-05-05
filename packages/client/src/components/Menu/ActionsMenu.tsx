import type { ReactElement, ReactNode } from 'react'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import { ChevronDownIcon } from 'lucide-react'
import { cn } from '../../utils/cn'
import { buttonVariants } from '../ui/button'
import styles from './ActionsMenu.module.css'
import baseStyles from './Menu.module.css'

export interface ActionsMenuProps {
  children: ReactNode
  label?: string
  disabled?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  'data-testid'?: string
}

export interface ActionsMenuItemProps {
  children?: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  closeOnClick?: boolean
  render?: ReactElement<Record<string, unknown>> | ((props: unknown, state: unknown) => ReactElement)
  'data-testid'?: string
}

export interface ActionsMenuCheckboxItemProps {
  children: ReactNode
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  'data-testid'?: string
}

export interface ActionsMenuMessageProps {
  children: ReactNode
}

function ActionsMenuTrigger({
  label = 'Actions',
  disabled,
  className,
  ...props
}: {
  label?: string
  disabled?: boolean
  className?: string
  'data-testid'?: string
}) {
  return (
    <BaseMenu.Trigger
      disabled={disabled}
      className={cn(buttonVariants({ variant: 'default' }), styles.trigger, className)}
      {...props}
    >
      {label} <ChevronDownIcon height={10} />
    </BaseMenu.Trigger>
  )
}

function ActionsMenuItem({
  children,
  onClick,
  disabled,
  className,
  closeOnClick = true,
  render,
  'data-testid': dataTestId,
}: ActionsMenuItemProps) {
  return (
    <BaseMenu.Item
      onClick={onClick}
      disabled={disabled}
      data-disabled={disabled || undefined}
      data-testid={dataTestId}
      closeOnClick={closeOnClick}
      className={`${baseStyles.item} ${className || ''}`}
      render={render}
    >
      {children}
    </BaseMenu.Item>
  )
}

function ActionsMenuCheckboxItem({
  children,
  checked,
  onCheckedChange,
  disabled,
  className,
  'data-testid': dataTestId,
}: ActionsMenuCheckboxItemProps) {
  return (
    <BaseMenu.CheckboxItem
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      data-testid={dataTestId}
      className={`${baseStyles.checkboxItem} ${className || ''}`}
    >
      <BaseMenu.CheckboxItemIndicator className={baseStyles.itemIndicator}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M10 3L4.5 8.5L2 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </BaseMenu.CheckboxItemIndicator>
      {children}
    </BaseMenu.CheckboxItem>
  )
}

function ActionsMenuSeparator() {
  return <BaseMenu.Separator className={baseStyles.separator} />
}

function ActionsMenuMessage({ children }: ActionsMenuMessageProps) {
  return <div className={styles.message}>{children}</div>
}

export function ActionsMenu({
  children,
  label = 'Actions',
  disabled,
  open,
  onOpenChange,
  className,
  'data-testid': dataTestId,
}: ActionsMenuProps) {
  return (
    <BaseMenu.Root open={open} onOpenChange={onOpenChange}>
      <ActionsMenuTrigger label={label} disabled={disabled} className={className} data-testid={dataTestId} />
      <BaseMenu.Portal>
        <BaseMenu.Positioner
          sideOffset={3}
          className={`${baseStyles.positioner} ${styles.positioner}`}
          side="bottom"
          align="end"
        >
          <BaseMenu.Popup className={baseStyles.popup} role="menu" aria-label={`${label} menu`}>
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  )
}

// Compound component pattern
ActionsMenu.Item = ActionsMenuItem
ActionsMenu.CheckboxItem = ActionsMenuCheckboxItem
ActionsMenu.Separator = ActionsMenuSeparator
ActionsMenu.Message = ActionsMenuMessage
