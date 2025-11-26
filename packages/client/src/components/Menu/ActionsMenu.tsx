import React from 'react'
import { Menu as BaseMenu } from '@base-ui-components/react/menu'
import styles from './ActionsMenu.module.css'
import baseStyles from './Menu.module.css'
import { ArrowIcon } from '../icons/ArrowIcon'
import { cn } from '../../utils/cn'

export interface ActionsMenuProps {
  children: React.ReactNode
  label?: string
  disabled?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  'data-testid'?: string
}

export interface ActionsMenuItemProps {
  children?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  closeOnClick?: boolean
  render?: React.ReactElement<Record<string, unknown>> | ((props: any, state: any) => React.ReactElement)
}

export interface ActionsMenuCheckboxItemProps {
  children: React.ReactNode
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export interface ActionsMenuMessageProps {
  children: React.ReactNode
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
      className={cn(baseStyles.trigger, styles.trigger, className)}
      disabled={disabled}
      {...props}
    >
      {label} <ArrowIcon />
    </BaseMenu.Trigger>
  )
}

function ActionsMenuItem({ 
  children, 
  onClick, 
  disabled, 
  className,
  closeOnClick = true,
  render
}: ActionsMenuItemProps) {
  return (
    <BaseMenu.Item
      onClick={onClick}
      disabled={disabled}
      data-disabled={disabled || undefined}
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
  className 
}: ActionsMenuCheckboxItemProps) {
  return (
    <BaseMenu.CheckboxItem
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={`${baseStyles.checkboxItem} ${className || ''}`}
    >
      <BaseMenu.CheckboxItemIndicator className={baseStyles.itemIndicator}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
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
      <ActionsMenuTrigger 
        label={label} 
        disabled={disabled}
        className={className}
        data-testid={dataTestId}
      />
      <BaseMenu.Portal>
        <BaseMenu.Positioner sideOffset={3}  className={`${baseStyles.positioner} ${styles.positioner}`} side="bottom" align="end">
          <BaseMenu.Popup className={baseStyles.popup}>
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
