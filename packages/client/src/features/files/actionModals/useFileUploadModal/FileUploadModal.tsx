import React, { useCallback, useRef, useSyncExternalStore } from 'react'
import clsx from 'clsx'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router'
import { Button } from '@/components/Button'
import { InputError } from '@/components/form/styles'
import { itemsCountString } from '@/utils/formatting'
import { HomeScope, MetaPath } from '../../../home/types'
import { ModalHeaderTop, ModalNext } from '../../../modal/ModalNext'
import { ButtonRow, Footer, ModalScrollAutoHeight } from '../../../modal/styles'
import { MAX_UPLOADABLE_FILES } from './constants'
import styles from './FileUploadModal.module.css'
import { FileUploadStore } from './FileUploadStore'
import { FileUploadTable } from './FileUploadTable'
import { FloatingBubble } from './FloatingBubble'
import { UploadHeaderText } from './UploadHeaderText'
import { UseMultiFileUploadResult } from './useMultiFileUpload'

// Module-level selector for allFilesTerminal to avoid recreating in component
const selectAllFilesTerminal = (store: FileUploadStore): boolean => {
  const files = store.getFiles()
  return (
    files.length > 0 &&
    files.every(file => file.status === 'completed' || file.status === 'failed' || file.status === 'cancelled')
  )
}

// Stable reference for webkitdirectory attribute to avoid creating new object on every render
const FOLDER_INPUT_ATTRS = { webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>

export interface FileUploadModalProps {
  isShown: boolean
  onClose: () => void
  uploadState: UseMultiFileUploadResult
  spaceId?: string
  spaceName?: string
  homeScope?: HomeScope
  folderPath?: MetaPath[]
  isMinimized: boolean
  onMinimize: () => void
  onRestore: () => void
  onSwitchToLegacy?: () => void
}

export const FileUploadModal = ({
  isShown,
  onClose,
  uploadState,
  spaceId,
  spaceName,
  homeScope,
  folderPath,
  isMinimized,
  onMinimize,
  onRestore,
  onSwitchToLegacy,
}: FileUploadModalProps) => {
  const navigate = useNavigate()
  const {
    store,
    fileIds,
    filesCount,
    uploadInProgress,
    uploadFinished,
    exceedsMax,
    noneSelected,
    pausedUploadsCount,
    stoppedUploadsCount,
    failedUploadsCount,
    completedUploadsCount,
    canResume,
    handleFilesAdded,
    handleRemoveFile,
    handleRemoveAll,
    handleUpload,
    handleResume,
    pauseFile,
    resumeFile,
    cancelFile,
    retryFile,
    cancelAll,
  } = uploadState

  const showRemove = true

  // Use module-level selector with store's bound subscribe method
  const allFilesTerminal = useSyncExternalStore(store.subscribe, () => selectAllFilesTerminal(store))

  const { getRootProps, isDragActive } = useDropzone({
    disabled: uploadInProgress,
    onDropAccepted: handleFilesAdded,
    noClick: true,
    noKeyboard: true,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const handleFileButtonClick = useCallback(() => {
    if (!uploadInProgress && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [uploadInProgress])

  const handleFolderButtonClick = useCallback(() => {
    if (!uploadInProgress && folderInputRef.current) {
      folderInputRef.current.click()
    }
  }, [uploadInProgress])

  const handleDropZoneCardClick = useCallback(() => {
    if (!uploadInProgress) {
      handleFileButtonClick()
    }
  }, [uploadInProgress, handleFileButtonClick])

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (files && files.length > 0) {
        handleFilesAdded(Array.from(files))
        event.target.value = ''
      }
    },
    [handleFilesAdded],
  )

  const handleFolderInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (files && files.length > 0) {
        handleFilesAdded(Array.from(files))
        event.target.value = ''
      }
    },
    [handleFilesAdded],
  )

  const handleClose = useCallback(() => {
    if (uploadInProgress) {
      onMinimize()
      return
    }
    handleRemoveAll()
    onClose()
  }, [uploadInProgress, onMinimize, handleRemoveAll, onClose])

  const handleFileClick = useCallback(
    (fileUid: string) => {
      onMinimize()
      const basePath = spaceId ? `/spaces/${spaceId}` : '/home'
      navigate(`${basePath}/files/${fileUid}`)
    },
    [navigate, spaceId, onMinimize],
  )

  const handleDismissBubble = useCallback(() => {
    if (uploadInProgress) return
    handleRemoveAll()
    onClose()
  }, [uploadInProgress, handleRemoveAll, onClose])

  return (
    <>
      <FloatingBubble
        isMinimized={isMinimized}
        filesCount={filesCount}
        uploadInProgress={uploadInProgress}
        uploadFinished={uploadFinished}
        pausedUploadsCount={pausedUploadsCount}
        stoppedUploadsCount={stoppedUploadsCount}
        completedUploadsCount={completedUploadsCount}
        failedUploadsCount={failedUploadsCount}
        onRestore={onRestore}
        onDismiss={handleDismissBubble}
      />
      <ModalNext
        id="modal-files-upload"
        data-testid="modal-files-upload"
        isShown={isShown && !isMinimized}
        hide={handleClose}
        variant="large"
      >
        <ModalHeaderTop
          headerText={
            <UploadHeaderText
              uploadInProgress={uploadInProgress}
              spaceId={spaceId}
              spaceName={spaceName}
              homeScope={homeScope}
              folderPath={folderPath}
              onSwitchToLegacy={onSwitchToLegacy}
            />
          }
          hide={handleClose}
        />

        <ModalScrollAutoHeight
          className={clsx('flex flex-col', { [styles.dropZoneActive]: isDragActive && !uploadInProgress })}
          {...getRootProps()}
          data-testid="upload-modal-dropzone"
        >
          {/* Hidden file inputs for click-to-select */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
            data-testid="upload-modal-file-input"
          />
          <input
            ref={folderInputRef}
            type="file"
            {...FOLDER_INPUT_ATTRS}
            multiple
            onChange={handleFolderInputChange}
            style={{ display: 'none' }}
            data-testid="upload-modal-folder-input"
          />

          {!allFilesTerminal && !exceedsMax && !uploadInProgress && !canResume && (
            <div
              className={clsx(
                styles.dropZoneWrapper,
                uploadInProgress ? 'exit' : 'enter',
                filesCount > 0 ? 'flex-shrink' : 'flex-grow',
              )}
            >
              <div
                className={clsx(styles.dropZoneCard, { [styles.uploadInProgress]: uploadInProgress })}
                onClick={handleDropZoneCardClick}
              >
                <div className={styles.dropZoneContent}>
                  <p className={styles.dropZoneDescription}>Drag & drop files here, or select files to upload</p>
                  <div className={styles.dropZoneButtons}>
                    <Button
                      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                        event.stopPropagation()
                        handleFileButtonClick()
                      }}
                      data-variant="primary"
                      data-testid="upload-modal-select-files-btn"
                    >
                      Select Files
                    </Button>
                    <Button
                      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                        event.stopPropagation()
                        handleFolderButtonClick()
                      }}
                      data-variant="primary"
                      data-testid="upload-modal-select-folders-btn"
                    >
                      Select Folders
                    </Button>
                  </div>
                  <p className={styles.dropZoneLimit}>You can upload up to {MAX_UPLOADABLE_FILES} files at a time.</p>
                </div>
              </div>
            </div>
          )}

          <FileUploadTable
            store={store}
            fileIds={fileIds}
            showRemove={showRemove}
            uploadInProgress={uploadInProgress}
            handleRemoveFile={handleRemoveFile}
            onPauseFile={pauseFile}
            onResumeFile={resumeFile}
            onCancelFile={cancelFile}
            onRetryFile={retryFile}
            onFileClick={handleFileClick}
            isDragActive={isDragActive && !uploadInProgress}
          />
        </ModalScrollAutoHeight>
        <Footer>
          <ButtonRow className="grow">
            <div style={{ fontSize: '0.8rem', flexGrow: 1 }} data-testid="upload-modal-status">
              {uploadInProgress
                ? `${completedUploadsCount}/${filesCount} Completed${pausedUploadsCount > 0 ? ` • ${pausedUploadsCount} Paused` : ''}${stoppedUploadsCount > 0 ? ` • ${stoppedUploadsCount} Stopped` : ''}${failedUploadsCount > 0 ? ` • ${failedUploadsCount} Failed` : ''}`
                : `${itemsCountString('File', filesCount)} Ready to Upload`}
            </div>
            {exceedsMax && <InputError>You can only upload up to {MAX_UPLOADABLE_FILES} files at a time</InputError>}
            {uploadInProgress && (
              <>
                <Button onClick={cancelAll} data-variant="warning" data-testid="upload-modal-stop-all">
                  Stop All
                </Button>
              </>
            )}
            {showRemove && !uploadInProgress && !noneSelected && (
              <Button onClick={handleRemoveAll} data-testid="upload-modal-remove-all">
                Remove all
              </Button>
            )}
            {uploadFinished ? (
              <Button data-variant="primary" onClick={handleClose} data-testid="upload-modal-close">
                Close
              </Button>
            ) : canResume ? (
              !exceedsMax &&
              !uploadInProgress && (
                <Button
                  data-variant="primary"
                  type="submit"
                  onClick={handleResume}
                  data-testid="upload-modal-resume-all"
                >
                  Resume All
                </Button>
              )
            ) : (
              <Button
                data-variant="primary"
                type="submit"
                onClick={handleUpload}
                disabled={exceedsMax || uploadInProgress || noneSelected || allFilesTerminal}
                data-testid="upload-modal-upload"
              >
                Upload
              </Button>
            )}
          </ButtonRow>
        </Footer>
      </ModalNext>
    </>
  )
}
