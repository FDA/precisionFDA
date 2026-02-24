import React, { useEffect, useEffectEvent, useState } from 'react'
import ReactDOM from 'react-dom'
import { useKeyPress } from '../../hooks/useKeyPress'
import styles from './Sheet.module.css'

const TRANSITION_DURATION_MS = 220

export interface SheetProps {
  isOpen: boolean
  onClose: () => void
  'aria-label'?: string
  children: React.ReactNode
  'data-testid'?: string
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  'aria-label': ariaLabel,
  children,
  'data-testid': testId,
}) => {
  const [isMounted, setIsMounted] = useState(isOpen)
  const [transitionState, setTransitionState] = useState<'open' | 'closed'>(isOpen ? 'open' : 'closed')

  useEffect(() => {
    let timeoutId: number | undefined
    let frameId: number | undefined

    if (isOpen) {
      setIsMounted(true)
      frameId = requestAnimationFrame(() => setTransitionState('open'))
    } else if (isMounted) {
      setTransitionState('closed')
      timeoutId = window.setTimeout(() => {
        setIsMounted(false)
      }, TRANSITION_DURATION_MS)
    } else {
      setTransitionState('closed')
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
      if (frameId) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [isMounted, isOpen])

  const handleEsc = useEffectEvent((event: KeyboardEvent) => {
    if (!isOpen) {
      return
    }
    event.preventDefault()
    onClose()
  })

  useKeyPress('Escape', handleEsc)

  useEffect(() => {
    if (!isMounted) {
      return
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isMounted])

  if (!isMounted) {
    return null
  }

  const modalRoot = document.getElementById('modal-root')
  if (!modalRoot) {
    return null
  }

  return ReactDOM.createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={onClose}
      data-testid={testId}
      data-state={transitionState}
    >
      <section
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={event => event.stopPropagation()}
        data-state={transitionState}
      >
        {children}
      </section>
    </div>,
    modalRoot,
  )
}
