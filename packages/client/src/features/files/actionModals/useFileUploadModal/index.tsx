import { all, any } from 'ramda'
import React, { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useQueryClient } from '@tanstack/react-query'
import { useImmer } from 'use-immer'
import { InputError } from '../../../../components/form/styles'
import { TrashIcon } from '../../../../components/icons/TrashIcon'
import { createSequenceGenerator } from '../../../../utils'
import { ButtonRow, Footer, ModalScroll } from '../../../modal/styles'
import { useConditionalModal } from '../../../modal/useModal'
import { HomeScope } from '../../../home/types'
import { itemsCountString } from '../../../../utils/formatting'
import { FilesMeta, FILE_STATUS, IUploadInfo, MAX_UPLOADABLE_FILES, FileStatusTypes } from './constants'
import { multiFileUpload } from './multiFileUpload'
import { ModalHeaderTop, ModalNext } from '../../../modal/ModalNext'
import { Button } from '../../../../components/Button'
import { UploadIcon } from '../../../../components/icons/UploadIcon'
import { Done, Failed, Running } from '../../../../components/icons/StateIcons'
import {
  DropZoneCard,
  DropZoneContent,
  DropZoneDescription,
  DropZoneTitle,
  DropZoneWrapper,
  FileItem,
  FileName,
  IconWrapper,
  RemoveButton,
  StatusContainer,
  StatusWrapper,
  UploadFilesContainer,
  UploadFilesHeader,
} from './styles'
import { toastError, toastSuccess } from '../../../../components/NotificationCenter/ToastHelper'

interface FileUploadTableProps {
  filesMeta: FilesMeta[]
  showRemove: boolean
  uploadInProgress: boolean
  handleRemoveFile: (id: string) => void
}

const FileUploadTable = ({ filesMeta, showRemove, uploadInProgress, handleRemoveFile }: FileUploadTableProps) => {
  if (filesMeta.length === 0) {
    return null
  }

  return (
    <UploadFilesContainer>
      <UploadFilesHeader $showRemove={showRemove}>
        <div>File Name</div>
        <div>Status</div>
        {showRemove && <div>Action</div>}
      </UploadFilesHeader>
      {filesMeta.map(file => (
        <FileItem key={file.id} $showRemove={showRemove}>
          <FileName>
            <div className="file-name-text" title={file.name}>
              {file.name}
            </div>
          </FileName>

          <StatusWrapper>
            <FileUploadStatus status={file.status} />
          </StatusWrapper>

          {showRemove && (
            <RemoveButton disabled={uploadInProgress} onClick={() => handleRemoveFile(file.id)} title="Remove file">
              <TrashIcon />
            </RemoveButton>
          )}
        </FileItem>
      ))}
    </UploadFilesContainer>
  )
}

export const FileUploadStatus = ({ status }: { status: FileStatusTypes }) => {
  if (status === 'added') {
    return <StatusContainer>Ready to upload</StatusContainer>
  }

  const icon = status === 'uploaded' ? <Done /> : status === 'failure' ? <Failed /> : <Running />

  return (
    <StatusContainer>
      {icon}
      {status}
    </StatusContainer>
  )
}
const idGenerator = createSequenceGenerator()

interface DropzoneFile extends File {
  path?: string
  generatedId: string
}

const isUniqFile = (blobs: DropzoneFile[], file: DropzoneFile): boolean =>
  !blobs.find(
    (blob: DropzoneFile) =>
      blob.name === file.name &&
      blob.lastModified === file.lastModified &&
      blob.size === file.size &&
      blob.type === file.type &&
      blob.path === file.path,
  )

type UploadModalArgs = {
  homeScope?: HomeScope
  folderId?: string
  spaceId?: string
  isAllowed: boolean
  onViolation: () => void
  onUpload?: () => void
}

export const useFileUploadModal = ({ homeScope, folderId, spaceId, isAllowed, onViolation, onUpload }: UploadModalArgs) => {
  const queryCache = useQueryClient()
  const { isShown, setShowModal } = useConditionalModal(isAllowed, onViolation)
  const [filesMeta, setFilesMeta] = useImmer<FilesMeta[]>([])
  const [blobs, setBlobs] = useState<DropzoneFile[]>([])

  const statuses = filesMeta.map(file => file.status)
  const uploadInProgress = any(
    status => [FILE_STATUS['preparing'], FILE_STATUS['uploading'], FILE_STATUS['finalizing']].includes(status),
    statuses,
  )
  const uploadFinished = filesMeta.length > 0 && all(s => [FILE_STATUS['uploaded']].includes(s), statuses)
  const exceedsMax = filesMeta.length > MAX_UPLOADABLE_FILES
  const noneSelected = filesMeta.length === 0
  const showRemove = !uploadFinished || !uploadInProgress

  const { getRootProps, getInputProps } = useDropzone({
    disabled: uploadInProgress,
    onDropAccepted: (accepted: File[]) => {
      const uniqBlob: DropzoneFile[] = []
      const fil: FilesMeta[] = []
      accepted.forEach((file: File) => {
        const f = file as DropzoneFile
        if (isUniqFile(blobs, f)) {
          f.generatedId = idGenerator.next().value!.toString()
          uniqBlob.push(f)
          fil.push({
            id: f.generatedId,
            name: f.name,
            size: f.size,
            status: FILE_STATUS.added as FileStatusTypes,
            uploadedSize: 0,
          })
        }
      })
      setFilesMeta([...filesMeta, ...fil])
      setBlobs([...blobs, ...uniqBlob])
    },
  })

  useEffect(() => {
    if (!uploadFinished) return

    toastSuccess(`Successfully uploaded ${itemsCountString('file', filesMeta.length)}`)

    const keysToInvalidate = [['files'], ['counters'], ...(spaceId ? [['space', spaceId.toString()]] : [])]

    keysToInvalidate.forEach(queryKey => {
      queryCache.invalidateQueries({ queryKey })
    })
  }, [uploadFinished])

  const handleRemoveAll = () => {
    setFilesMeta(() => [])
    setBlobs([])
  }

  const handleClose = () => {
    handleRemoveAll()
    setShowModal(false)
  }

  const handleRemoveFile = (id: string) => {
    const newFilesMeta = filesMeta.filter(f => f.id !== id)
    setFilesMeta(newFilesMeta)
    const newBlobs = blobs.filter(b => b.generatedId !== id)
    setBlobs(newBlobs)
  }

  const updateFilesStatus = (info: IUploadInfo) => {
    setFilesMeta((draft: FilesMeta[]) => {
      const f = draft.find((file: FilesMeta) => file.id === info.id)
      if (f) {
        f.status = info.status
        f.uploadedSize = info.uploadedSize
      }
    })
  }

  const handleUpload = async () => {
    if (onUpload) onUpload()
    try {
      await multiFileUpload({
        filesBlob: blobs,
        filesMeta,
        updateFileStatus: updateFilesStatus,
        scope: homeScope === 'me' ? 'private' : homeScope === 'everybody' ? 'public' : homeScope,
        spaceId,
        folderId,
      })
    } catch (error: unknown) {
      toastError(error instanceof Error ? error.message : 'An error occurred during upload')
    }
  }

  const modalComp = (
    <ModalNext
      id="modal-files-upload"
      data-testid="modal-files-upload"
      isShown={Boolean(isShown)}
      hide={() => {}}
      variant="medium"
    >
      <ModalHeaderTop headerText={`Upload files to ${folderId ? 'folder' : 'root'}`} hide={handleClose} />
      <DropZoneWrapper className={uploadInProgress ? 'exit' : 'enter'}>
        <DropZoneCard {...getRootProps()} $uploadInProgress={uploadInProgress}>
          <input {...getInputProps()} />
          <DropZoneContent>
            <IconWrapper>
              <UploadIcon />
            </IconWrapper>
            <DropZoneTitle>
              Drag & Drop or <span className="clickable">Select Files</span> For Upload
            </DropZoneTitle>
            <DropZoneDescription>You can upload up to 20 files at a time.</DropZoneDescription>
          </DropZoneContent>
        </DropZoneCard>
      </DropZoneWrapper>
      <ModalScroll>
        <FileUploadTable
          filesMeta={filesMeta}
          showRemove={showRemove}
          uploadInProgress={uploadInProgress}
          handleRemoveFile={handleRemoveFile}
        />
      </ModalScroll>
      <Footer>
        <ButtonRow>
          <div>{filesMeta.length} Files Selected</div>
          {exceedsMax && <InputError>You can only upload up to 20 files at a time</InputError>}
          {showRemove && (
            <Button disabled={uploadInProgress || noneSelected} onClick={handleRemoveAll}>
              Remove all
            </Button>
          )}
          {uploadFinished ? (
            <Button data-variant="primary" onClick={handleClose}>
              Close
            </Button>
          ) : (
            <Button
              data-variant="primary"
              type="submit"
              onClick={handleUpload}
              disabled={exceedsMax || uploadInProgress || noneSelected}
            >
              Upload
            </Button>
          )}
        </ButtonRow>
      </Footer>
    </ModalNext>
  )

  return {
    modalComp,
    setShowModal,
  }
}
