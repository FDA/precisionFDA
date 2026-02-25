import React, { useDeferredValue, useSyncExternalStore } from 'react'
import clsx from 'clsx'
import { ArrowDown, Hourglass, Pause, Play, RotateCcw, Square } from 'lucide-react'
import { Done, Failed, Running } from '@/components/icons/StateIcons'
import { ThreeDotsIcon } from '@/components/icons/ThreeDotsIcon'
import { TrashIcon } from '@/components/icons/TrashIcon'
import Menu from '@/components/Menu/Menu'
import type { FilesMeta } from './constants'
import styles from './FileUploadModal.module.css'
import { FileUploadStore } from './FileUploadStore'
import { useAnimatedProgress } from './useAnimatedProgress'
import { useAutoScroll } from './useAutoScroll'
import {
  calculateSpeed,
  formatDuration,
  formatFileSize,
  formatSpeed,
  isActiveUploadStatus,
  isCancellableStatus,
  splitDisplayPath,
} from './utils'

const selectFileById = (store: FileUploadStore, fileId: string): FilesMeta | undefined => store.getFile(fileId)

interface FileUploadTableProps {
  store: FileUploadStore
  fileIds: string[]
  showRemove: boolean
  uploadInProgress: boolean
  handleRemoveFile: (id: string) => void
  onFileClick?: (fileUid: string) => void
  isDragActive?: boolean
}

interface FileUploadTableActions {
  onPauseFile?: (id: string) => void
  onResumeFile?: (id: string) => void
  onCancelFile?: (id: string) => void
  onRetryFile?: (id: string) => void
}

const getDurationLabel = (file: FilesMeta) => {
  if (!file.uploadStartedAt) {
    return '--'
  }

  const isLiveDuration = !file.completedAt && isActiveUploadStatus(file.status)
  const effectiveEnd = file.completedAt ?? (isLiveDuration ? Date.now() : file.uploadStartedAt)
  const elapsedMs = Math.max(0, effectiveEnd - file.uploadStartedAt)

  return formatDuration(elapsedMs)
}

interface FileUploadRowProps {
  store: FileUploadStore
  fileId: string
  showRemove: boolean
  uploadInProgress: boolean
  handleRemoveFile: (id: string) => void
  onPauseFile?: (id: string) => void
  onResumeFile?: (id: string) => void
  onCancelFile?: (id: string) => void
  onRetryFile?: (id: string) => void
  onFileClick?: (fileUid: string) => void
  setFileRef: (id: string, el: HTMLDivElement | null) => void
  activeMenuFileId: string | null
  onMenuOpen: (id: string | null) => void
}

const FileUploadRow = React.memo(function FileUploadRow({
  store,
  fileId,
  showRemove,
  uploadInProgress,
  handleRemoveFile,
  onPauseFile,
  onResumeFile,
  onCancelFile,
  onRetryFile,
  onFileClick,
  setFileRef,
  activeMenuFileId,
  onMenuOpen,
}: FileUploadRowProps) {
  const subscribeToFile = React.useCallback(
    (listener: () => void) => store.subscribeToFile(fileId, listener),
    [store, fileId],
  )
  const getFileSnapshot = React.useCallback(() => selectFileById(store, fileId), [store, fileId])
  const file = useSyncExternalStore(
    subscribeToFile,
    getFileSnapshot,
  )

  if (!file) return null

  const fullPath = file.relativePath ?? file.name
  const { directory, fileName } = splitDisplayPath(fullPath)
  const sizeLabel = formatFileSize(file.size)
  const durationLabel = getDurationLabel(file)
  const canCancel = isCancellableStatus(file.status)
  const showCancelButton = canCancel
  // Don't show remove for finalizing files - they can't be cancelled
  const showRemoveButton =
    !showCancelButton &&
    file.status !== 'finalizing' &&
    (file.status === 'cancelled' ||
      file.status === 'failed' ||
      file.status === 'pending' ||
      (showRemove && file.status !== 'completed'))
  const showActions = showCancelButton || showRemoveButton
  const isMenuOpen = activeMenuFileId === fileId

  return (
    <div
      className={clsx(styles.fileItem, { [styles.menuOpen]: isMenuOpen })}
      ref={el => setFileRef(file.id, el)}
      data-testid="upload-modal-file-row"
    >
      <div className={styles.fileName}>
        <div className={styles.fileNameText} title={fullPath}>
          {directory && <span className={styles.fileNamePath}>{directory}/</span>}
          {file.status === 'completed' && file.fileUid ? (
            <span
              className={styles.fileNameBase}
              style={{ cursor: 'pointer', color: 'var(--c-link)', textDecoration: 'underline' }}
              onClick={() => onFileClick?.(file.fileUid!)}
              role="link"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onFileClick?.(file.fileUid!)
                }
              }}
            >
              {fileName}
            </span>
          ) : (
            <span className={styles.fileNameBase}>{fileName}</span>
          )}
        </div>
      </div>

      <div className={styles.fileStat}>{sizeLabel}</div>

      <div className={styles.statusWrapper}>
        <FileUploadStatus file={file} />
      </div>

      <div className={styles.fileStat}>{durationLabel}</div>

      {showActions ? (
        <div className="align-center flex justify-end gap-2">
          {/* Inline action icons */}
          {file.status === 'paused' ? (
            <button
              className={styles.removeButton}
              onClick={() => onResumeFile?.(file.id)}
              title="Resume upload"
              data-testid={`resume-file-${file.id}`}
            >
              <Play size={16} />
            </button>
          ) : file.status === 'uploading' ||
            file.status === 'hashing' ||
            file.status === 'preparing' ||
            file.status === 'queued' ? (
            <button
              className={styles.removeButton}
              onClick={() => onPauseFile?.(file.id)}
              title="Pause upload"
              data-testid={`pause-file-${file.id}`}
            >
              <Pause size={16} />
            </button>
          ) : null}

          {(file.status === 'failed' || file.status === 'cancelled') && (
            <button
              className={styles.removeButton}
              onClick={() => onRetryFile?.(file.id)}
              title="Retry upload"
              data-testid={`retry-file-${file.id}`}
            >
              <RotateCcw size={16} />
            </button>
          )}

          {showCancelButton ? (
            <button
              className={styles.removeButton}
              onClick={() => onCancelFile?.(file.id)}
              title="Cancel upload"
              data-testid={`cancel-file-${file.id}`}
            >
              <Square size={16} />
            </button>
          ) : showRemoveButton ? (
            <button
              className={styles.removeButton}
              onClick={() => {
                // Cancel first if upload is cancellable (ensures cleanup)
                if (isCancellableStatus(file.status) && onCancelFile) {
                  onCancelFile(file.id)
                }
                handleRemoveFile(file.id)
              }}
              title="Remove file"
              data-testid={`remove-file-${file.id}`}
            >
              <TrashIcon />
            </button>
          ) : null}

          <FileActionsMenu
            file={file}
            uploadInProgress={uploadInProgress}
            onPauseFile={onPauseFile}
            onResumeFile={onResumeFile}
            onCancelFile={onCancelFile}
            onRetryFile={onRetryFile}
            handleRemoveFile={handleRemoveFile}
            onMenuOpen={isOpen => onMenuOpen(isOpen ? file.id : null)}
          />
        </div>
      ) : (
        <div />
      )}
    </div>
  )
})

export const FileUploadTable = ({
  store,
  fileIds,
  showRemove,
  uploadInProgress,
  handleRemoveFile,
  onPauseFile,
  onResumeFile,
  onCancelFile,
  onRetryFile,
  onFileClick,
  isDragActive,
}: FileUploadTableProps & FileUploadTableActions) => {
  const [activeMenuFileId, setActiveMenuFileId] = React.useState<string | null>(null)
  const { autoScroll, setAutoScroll, fileRefs, showAutoScrollButton } = useAutoScroll({
    store,
    uploadInProgress,
    minFilesForAutoScroll: 5,
  })

  // Use deferred value for large file lists (up to 200 files) to keep UI responsive
  const deferredFileIds = useDeferredValue(fileIds)

  const setFileRef = React.useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      fileRefs.current.set(id, el)
    } else {
      fileRefs.current.delete(id)
    }
  }, [])

  if (fileIds.length === 0) {
    return null
  }

  return (
    <>
      <div
        className={clsx(styles.uploadFilesContainer, {
          [styles.hasActiveMenu]: !!activeMenuFileId,
          [styles.dragActive]: isDragActive,
        })}
        data-testid="upload-modal-file-list"
      >
        <div className={styles.uploadFilesHeader}>
          <div>File Name</div>
          <div>Total Size</div>
          <div>Status</div>
          <div>Duration</div>
          <div style={{ paddingLeft: 12 }}>Actions</div>
        </div>
        {deferredFileIds.map(fileId => (
          <FileUploadRow
            key={fileId}
            store={store}
            fileId={fileId}
            showRemove={showRemove}
            uploadInProgress={uploadInProgress}
            handleRemoveFile={handleRemoveFile}
            onPauseFile={onPauseFile}
            onResumeFile={onResumeFile}
            onCancelFile={onCancelFile}
            onRetryFile={onRetryFile}
            onFileClick={onFileClick}
            setFileRef={setFileRef}
            activeMenuFileId={activeMenuFileId}
            onMenuOpen={setActiveMenuFileId}
          />
        ))}
      </div>

      {showAutoScrollButton && (
        <div className={styles.autoScrollFooter}>
          <button
            className={clsx(styles.autoScrollButton, { [styles.isActive]: autoScroll })}
            onClick={() => setAutoScroll(!autoScroll)}
            data-testid="upload-modal-auto-scroll"
          >
            <ArrowDown size={16} />
            {autoScroll ? 'Auto-Scrolling...' : 'Auto Scroll Uploads'}
          </button>
        </div>
      )}
    </>
  )
}

interface FileActionsMenuProps {
  file: FilesMeta
  uploadInProgress: boolean
  onPauseFile?: (id: string) => void
  onResumeFile?: (id: string) => void
  onCancelFile?: (id: string) => void
  onRetryFile?: (id: string) => void
  handleRemoveFile: (id: string) => void
  onMenuOpen: (isOpen: boolean) => void
}

const FileActionsMenu = ({
  file,
  onPauseFile,
  onResumeFile,
  onCancelFile,
  onRetryFile,
  handleRemoveFile,
  onMenuOpen,
}: FileActionsMenuProps) => {
  return (
    <div className={styles.actionsWrapper}>
      <Menu
        onOpenChange={onMenuOpen}
        trigger={
          <Menu.Trigger className={styles.actionButton} aria-label="Actions" data-testid={`actions-menu-${file.id}`}>
            <ThreeDotsIcon />
          </Menu.Trigger>
        }
        positioner={{ sideOffset: 8, align: 'end', style: { zIndex: 2100 } }}
      >
        {/* Only show Pause/Resume for cancellable uploads (excludes finalizing) */}
        {isCancellableStatus(file.status) && (
          <Menu.Item
            render={
              <button
                className={styles.actionItem}
                data-testid={`menu-${file.status === 'paused' ? 'resume' : 'pause'}-${file.id}`}
              />
            }
            onClick={() => {
              if (file.status === 'paused') {
                onResumeFile?.(file.id)
              } else {
                onPauseFile?.(file.id)
              }
            }}
          >
            {file.status === 'paused' ? 'Resume' : 'Pause'}
          </Menu.Item>
        )}

        {(file.status === 'failed' || file.status === 'cancelled') && (
          <Menu.Item
            render={<button className={styles.actionItem} data-testid={`menu-retry-${file.id}`} />}
            onClick={() => {
              onRetryFile?.(file.id)
            }}
          >
            Retry
          </Menu.Item>
        )}

        {/* Only show Cancel for cancellable uploads (excludes finalizing) */}
        {isCancellableStatus(file.status) && (
          <Menu.Item
            render={<button className={styles.actionItem} data-testid={`menu-cancel-${file.id}`} />}
            onClick={() => {
              onCancelFile?.(file.id)
            }}
          >
            Cancel
          </Menu.Item>
        )}

        {/* Don't show Remove for finalizing files - they can't be cancelled */}
        {file.status !== 'finalizing' && (
          <Menu.Item
            render={<button className={styles.actionItem} data-testid={`menu-remove-${file.id}`} />}
            onClick={() => {
              // Cancel first if upload is cancellable (ensures cleanup)
              if (isCancellableStatus(file.status) && onCancelFile) {
                onCancelFile(file.id)
              }
              handleRemoveFile(file.id)
            }}
          >
            Remove
          </Menu.Item>
        )}
      </Menu>
    </div>
  )
}

export const FileUploadStatus = ({ file }: { file: FilesMeta }) => {
  const totalSize = file.size ?? 0
  const actualProgress = totalSize > 0 ? Math.min(100, Math.round((file.uploadedSize / totalSize) * 100)) : null
  const isActiveUpload = isActiveUploadStatus(file.status)

  const animatedProgress = useAnimatedProgress(actualProgress, isActiveUpload)
  const progress = isActiveUpload ? animatedProgress : actualProgress

  if (file.status === 'pending') {
    return (
      <div className={styles.statusContainer} data-testid="file-status-pending">
        Ready to upload
      </div>
    )
  }

  const icon =
    file.status === 'completed' ? (
      <Done />
    ) : file.status === 'failed' || file.status === 'cancelled' ? (
      <Failed />
    ) : file.status === 'paused' ? (
      <Pause size={16} />
    ) : file.status === 'queued' ? (
      <Hourglass size={16} />
    ) : (
      <Running />
    )

  // Calculate speed on demand
  const speed = calculateSpeed(file)
  const speedLabel = formatSpeed(speed)
  const details: string[] = []

  if (progress !== null && file.status !== 'failed' && file.status !== 'completed' && file.status !== 'cancelled') {
    details.push(`${progress}%`)
  }

  if (speedLabel && file.status !== 'paused' && file.status !== 'cancelled') {
    details.push(speedLabel)
  }

  const statusLabel = (() => {
    switch (file.status) {
      case 'queued':
        return 'Queued'
      case 'preparing':
        return 'Preparing'
      case 'creating':
        return 'Creating'
      case 'hashing':
        return 'Hashing'
      case 'uploading':
        return 'Uploading'
      case 'retrying':
        return 'Retrying'
      case 'finalizing':
        return 'Finalizing'
      case 'paused':
        return 'Paused'
      case 'cancelled':
        return 'Cancelled'
      case 'failed':
        return 'Failed'
      case 'completed':
        return 'Completed'
      default:
        return file.status
    }
  })()

  const statusText = details.length > 0 ? `${statusLabel} · ${details.join(' · ')}` : statusLabel

  return (
    <div className={styles.statusContainer} title={file.error} data-testid={`file-status-${file.status}`}>
      {icon}
      <span style={{ textTransform: 'none' }}>{statusText}</span>
    </div>
  )
}
