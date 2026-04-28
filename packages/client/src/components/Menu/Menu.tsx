import React from 'react'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import styles from './Menu.module.css'
import { cn } from '../../utils/cn'

export interface MenuTriggerProps {
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent) => void
  'aria-label'?: string
  'data-testid'?: string
  tabIndex?: number
}

export interface MenuItemProps {
  children?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  closeOnClick?: boolean
  render?: React.ReactElement<Record<string, unknown>> | ((props: any, state: any) => React.ReactElement)
}

export interface MenuCheckboxItemProps {
  children: React.ReactNode
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export interface MenuRadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export interface MenuRadioItemProps {
  value: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

export interface MenuGroupProps {
  children: React.ReactNode
  label?: string
  className?: string
}

export interface MenuSubmenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
}

export interface MenuProps {
  children: React.ReactNode
  trigger: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  positioner?: React.ComponentProps<typeof BaseMenu.Positioner>
  disableInitialFocus?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MenuTrigger({ children, className, onClick, ...props }: MenuTriggerProps) {
  return (
    <BaseMenu.Trigger className={cn(styles.trigger, className)} {...props}>
      {children}
    </BaseMenu.Trigger>
  )
}

function MenuItem({ 
  children, 
  onClick, 
  disabled, 
  className,
  closeOnClick = true,
  render,
}: MenuItemProps) {
  return (
    <BaseMenu.Item
      onClick={onClick}
      disabled={disabled || undefined}
      closeOnClick={closeOnClick}
      className={`${styles.item} ${className || ''}`}
      render={render}
    >
      {children}
    </BaseMenu.Item>
  )
}

function MenuCheckboxItem({ 
  children, 
  checked, 
  onCheckedChange, 
  disabled,
  className,
}: MenuCheckboxItemProps) {
  return (
    <BaseMenu.CheckboxItem
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={`${styles.checkboxItem} ${className || ''}`}
    >
      <BaseMenu.CheckboxItemIndicator className={styles.itemIndicator}>
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

function MenuRadioGroup({ value, onValueChange, children }: MenuRadioGroupProps) {
  return (
    <BaseMenu.RadioGroup value={value} onValueChange={onValueChange}>
      {children}
    </BaseMenu.RadioGroup>
  )
}

function MenuRadioItem({ value, children, disabled, className }: MenuRadioItemProps) {
  return (
    <BaseMenu.RadioItem
      value={value}
      disabled={disabled}
      className={`${styles.radioItem} ${className || ''}`}
    >
      <BaseMenu.RadioItemIndicator className={styles.itemIndicator}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="3" fill="currentColor" />
        </svg>
      </BaseMenu.RadioItemIndicator>
      {children}
    </BaseMenu.RadioItem>
  )
}

function MenuSeparator() {
  return <BaseMenu.Separator className={styles.separator} />
}

function MenuGroup({ children, label, className }: MenuGroupProps) {
  return (
    <BaseMenu.Group className={className}>
      {label && (
        <BaseMenu.GroupLabel className={styles.groupLabel}>
          {label}
        </BaseMenu.GroupLabel>
      )}
      {children}
    </BaseMenu.Group>
  )
}

function MenuSubmenu({ trigger, children }: MenuSubmenuProps) {
  return (
    <BaseMenu.SubmenuRoot>
      <BaseMenu.SubmenuTrigger className={styles.subTrigger}>
        {trigger}
        <svg
          className={styles.chevron}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M6 4L10 8L6 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </BaseMenu.SubmenuTrigger>
      <BaseMenu.Portal>
        <BaseMenu.Positioner className={styles.positioner}>
          <BaseMenu.Popup className={styles.popup}>
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.SubmenuRoot>
  )
}

function Menu({ children, trigger, open, onOpenChange, positioner = { side: 'bottom', align: 'end' }, disableInitialFocus = false }: MenuProps) {
  return (
    <BaseMenu.Root open={open} onOpenChange={onOpenChange}>
      {trigger}
      <BaseMenu.Portal>
        <BaseMenu.Positioner className={styles.positioner} {...positioner}>
          <BaseMenu.Popup className={styles.popup}>
            {disableInitialFocus && (
              <button
                type="button"
                tabIndex={0}
                style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none', overflow: 'hidden', padding: 0, border: 'none', background: 'none' }}
              />
            )}
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  )
}

// Compound component pattern
Menu.Trigger = MenuTrigger
Menu.Item = MenuItem
Menu.CheckboxItem = MenuCheckboxItem
Menu.RadioGroup = MenuRadioGroup
Menu.RadioItem = MenuRadioItem
Menu.Separator = MenuSeparator
Menu.Group = MenuGroup
Menu.Submenu = MenuSubmenu

export default Menu
