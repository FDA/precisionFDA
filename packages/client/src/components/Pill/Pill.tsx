import React from 'react'
import styles from './Pill.module.css'
import { cn } from '../../utils/cn'

export type PillVariant = 'default' | 'primary' | 'secondary' | 'success' | 'orange'
export type PillSize = 'small' | 'medium' | 'large'

export interface PillProps {
  /**
   * The content to display inside the pill
   */
  children: React.ReactNode
  /**
   * The visual variant of the pill
   * @default 'default'
   */
  variant?: PillVariant
  /**
   * The size of the pill
   * @default 'medium'
   */
  size?: PillSize
  /**
   * Optional icon to display before the text
   */
  icon?: React.ReactNode
  /**
   * Whether the pill is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Optional CSS class name
   */
  className?: string
  /**
   * Optional click handler
   */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  /**
   * Optional title attribute for tooltip
   */
  title?: string
}

export const Pill = React.forwardRef<HTMLDivElement, PillProps>(
  ({ children, variant = 'default', size = 'medium', icon, disabled = false, className, onClick, title }, ref) => {
    const variantClass = styles[`pill${variant.charAt(0).toUpperCase() + variant.slice(1)}`]
    const sizeClass = size !== 'medium' ? styles[`pill${size.charAt(0).toUpperCase() + size.slice(1)}`] : ''
    const disabledClass = disabled ? styles.pillDisabled : ''

    const pillClassName = [
      styles.pill,
      variantClass,
      sizeClass,
      disabledClass,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div
        ref={ref}
        className={cn(pillClassName)}
        onClick={onClick}
        title={title}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick && !disabled ? 0 : undefined}
        onKeyDown={onClick && !disabled ? (e) => e.key === 'Enter' && onClick(e as any) : undefined}
      >
        {icon && <span className={styles.icon}>{icon}</span>}
        {children}
      </div>
    )
  }
)

Pill.displayName = 'Pill'
