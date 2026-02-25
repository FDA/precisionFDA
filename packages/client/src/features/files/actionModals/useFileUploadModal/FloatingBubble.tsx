import { useCallback, useMemo } from 'react'
import { CloseIcon } from '@/components/icons/CloseIcon'
import { Done, Failed, Running } from '@/components/icons/StateIcons'
import styles from './FileUploadModal.module.css'

interface FloatingBubbleProps {
  isMinimized: boolean
  filesCount: number
  uploadInProgress: boolean
  uploadFinished: boolean
  pausedUploadsCount: number
  stoppedUploadsCount: number
  completedUploadsCount: number
  failedUploadsCount: number
  onRestore: () => void
  onDismiss: () => void
}

export const FloatingBubble = ({
  isMinimized,
  filesCount,
  uploadInProgress,
  uploadFinished,
  pausedUploadsCount,
  stoppedUploadsCount,
  completedUploadsCount,
  failedUploadsCount,
  onRestore,
  onDismiss,
}: FloatingBubbleProps) => {
  const shouldRenderBubble = isMinimized && filesCount > 0
  const canDismissBubble = shouldRenderBubble && !uploadInProgress

  const bubbleIcon = uploadFinished ? <Done /> : failedUploadsCount > 0 ? <Failed /> : <Running />

  const filesLabel = filesCount === 1 ? 'file' : 'files'

  const bubbleTitle = uploadFinished ? 'Upload Complete' : `Uploading ${filesCount} ${filesLabel}`

  const bubbleDetails = useMemo(() => {
    if (uploadFinished) {
      return `${filesCount} ${filesLabel} uploaded`
    }

    const parts: string[] = []
    if (completedUploadsCount > 0) {
      parts.push(`${completedUploadsCount} done`)
    }
    if (pausedUploadsCount > 0) {
      parts.push(`${pausedUploadsCount} paused`)
    }
    if (stoppedUploadsCount > 0) {
      parts.push(`${stoppedUploadsCount} stopped`)
    }
    if (failedUploadsCount > 0) {
      parts.push(`${failedUploadsCount} failed`)
    }
    return parts.join(' • ') || 'Preparing uploads'
  }, [
    completedUploadsCount,
    pausedUploadsCount,
    stoppedUploadsCount,
    failedUploadsCount,
    uploadFinished,
    filesCount,
    filesLabel,
  ])

  const handleRestore = useCallback(() => {
    onRestore()
  }, [onRestore])

  const handleDismiss = useCallback(() => {
    if (uploadInProgress) {
      return
    }
    onDismiss()
  }, [uploadInProgress, onDismiss])

  if (!shouldRenderBubble) return null

  return (
    <div className={styles.floatingBubbleContainer} data-testid="upload-floating-bubble">
      <div className={styles.floatingBubbleCard}>
        <button
          className={styles.floatingBubbleButton}
          type="button"
          onClick={handleRestore}
          aria-label="Open upload progress"
          data-testid="upload-bubble-restore"
        >
          <span className={styles.floatingBubbleIcon}>{bubbleIcon}</span>
          <div className={styles.floatingBubbleContent}>
            <span className={styles.floatingBubbleTitle} title={bubbleTitle}>
              {bubbleTitle}
            </span>
            <span className={styles.floatingBubbleSubtitle} title={bubbleDetails}>
              {bubbleDetails}
            </span>
          </div>
        </button>
        {canDismissBubble && (
          <button
            className={styles.floatingBubbleClose}
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss upload summary"
            data-testid="upload-bubble-dismiss"
          >
            <CloseIcon width={12} height={12} />
          </button>
        )}
      </div>
    </div>
  )
}
