import React from 'react'
import { Check, CopyIcon } from 'lucide-react'
import styles from './CopyText.module.css'
import { cn } from '../../utils/cn'

interface CopyTextProps {
  value: string
  children?: React.ReactNode
  className?: string
  onCopy?: () => void
  iconSize?: number
  iconColor?: string
  iconSuccessColor?: string
}

export const CopyText = ({
  value,
  children,
  className,
  onCopy,
  iconSize = 12,
  iconColor,
  iconSuccessColor = 'var(--success-500)',
  ...props
}: CopyTextProps) => {
  const [isCopied, setIsCopied] = React.useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(value)
    setIsCopied(true)
    onCopy?.()
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div
      className={className}
      onClick={handleCopy}
      role="button"
      title='Copy to Clipboard'
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCopy(e as any)
        }
      }}
      {...props}
    >
      {isCopied ? (
        <Check height={iconSize} color={iconSuccessColor} className={cn(styles.animatedCheck, styles.icon)} />
      ) : (
        <CopyIcon height={iconSize} color={iconColor} className={styles.icon} />
      )}
      {children}
    </div>
  )
}
