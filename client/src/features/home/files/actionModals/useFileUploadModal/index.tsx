/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable dot-notation */
import { all, any } from 'ramda'
import React, { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useImmer } from 'use-immer'
import { Button, ButtonSolidBlue, TransparentButton } from '../../../../../components/Button'
import { InputError } from '../../../../../components/form/styles'
import { TrashIcon } from '../../../../../components/icons/TrashIcon'
import { createSequenceGenerator } from '../../../../../utils'
import { ButtonRow, Footer, ModalScroll } from '../../../../modal/styles'
import { useConditionalModal } from '../../../../modal/useModal'
import { ResourceScope } from '../../../types'
import { itemsCountString } from '../../../../../utils/formatting'
import {
  FilesMeta,
  FILE_STATUS,
  IUploadInfo,
  MAX_UPLOADABLE_FILES,
} from './constants'
import { multiFileUpload } from './multiFileUpload'
import {
  Remove,
  Status,
  StyledDropSection,
  SubTitle,
  UploadFilesTable,
} from './styles'
import { ModalHeaderTop, ModalNext } from '../../../../modal/ModalNext'

const idGenerator = createSequenceGenerator()

const isUniqFile = (blobs: any, file: any) =>
  !blobs.find(
    (blob: any) =>
      blob.name === file.name &&
      blob.lastModified === file.lastModified &&
      blob.size === file.size &&
      blob.type === file.type &&
      blob.path === file.path,
  )

type UploadModalArgs = {
  scope?: ResourceScope
  folderId?: string
  spaceId?: string
  isAllowed: boolean
  onViolation: () => void
}

export const useFileUploadModal = ({
  scope,
  folderId,
  spaceId,
  isAllowed,
  onViolation,
}: UploadModalArgs) => {
  const queryCache = useQueryClient()
  const { isShown, setShowModal } = useConditionalModal(isAllowed, onViolation)
  const [filesMeta, setFilesMeta] = useImmer<FilesMeta[]>([])
  const [blobs, setBlobs] = useState<any[]>([])

  const statuses = filesMeta.map(file => file.status)
  const uploadInProgress = any(
    status =>
      [
        FILE_STATUS['preparing'],
        FILE_STATUS['uploading'],
        FILE_STATUS['finalizing'],
      ].includes(status),
    statuses,
  )
  const uploadFinished =
    filesMeta.length > 0 &&
    all(s => [FILE_STATUS['uploaded']].includes(s), statuses)
  const exceedsMax = filesMeta.length > MAX_UPLOADABLE_FILES
  const noneSelected = filesMeta.length === 0

  const { getRootProps, getInputProps } = useDropzone({
    disabled: uploadInProgress,
    onDropAccepted: accepted => {
      const uniqBlob: any[] = []
      const fil: any[] = []
      accepted.forEach((file: any) => {
        const f = file
        if (isUniqFile(blobs, f)) {
          f.generatedId = idGenerator.next().value
          uniqBlob.push(f)
          fil.push({
            id: f.generatedId,
            name: f.name,
            size: f.size,
            status: FILE_STATUS['added'],
            uploadedSize: 0,
          })
        }
      })
      setFilesMeta([...filesMeta, ...fil])
      setBlobs([...blobs, ...uniqBlob])
    },
  })

  useEffect(() => {
    if (uploadFinished) {
      toast.success(
        `Success: uploaded ${itemsCountString('file', filesMeta.length)}`,
      )
      queryCache.invalidateQueries(['files'])
      queryCache.invalidateQueries(['counters'])
      if (spaceId) queryCache.invalidateQueries(['space', spaceId.toString()])
    }
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
    setFilesMeta((draft: any) => {
      const f = draft.find((file: any) => file.id === info.id)
      if (f) {
        f.status = info.status
        f.uploadedSize = info.uploadedSize
      }
    })
  }

  const handleUpload = async () => {
    try {
      await multiFileUpload({
        filesBlob: blobs,
        filesMeta,
        updateFileStatus: updateFilesStatus,
        scope:
          scope === 'me' ? 'private' : scope === 'everybody' ? 'public' : scope,
        spaceId,
        folderId,
      })
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const modalComp = isShown && (
    <ModalNext
      data-testid="modal-files-upload"
      isShown={Boolean(isShown)}
      hide={handleClose}
    >
      <ModalHeaderTop
        headerText={`Upload files to ${folderId ? 'folder' : 'root'}`}
        hide={handleClose}
      />
      <StyledDropSection>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <ButtonSolidBlue disabled={uploadInProgress}>
            Browse files for upload...
          </ButtonSolidBlue>
        </div>
        <SubTitle>You can upload up to 20 files at a time</SubTitle>
      </StyledDropSection>
      <ModalScroll>
        {filesMeta.length > 0 && (
          <UploadFilesTable>
            <thead>
              <tr>
                <th>Name</th>
                <Status>Status</Status>
                <Remove>Remove</Remove>
              </tr>
            </thead>
            <tbody>
              {filesMeta.map(f => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <Status>{f.status}</Status>
                  <Remove>
                    <TransparentButton
                      disabled={uploadInProgress}
                      onClick={() => handleRemoveFile(f.id)}
                    >
                      <TrashIcon height={16} />
                    </TransparentButton>
                  </Remove>
                </tr>
              ))}
            </tbody>
          </UploadFilesTable>
        )}
      </ModalScroll>
      <Footer>
        <ButtonRow>
          <div>{filesMeta.length} Files Selected</div>
          {exceedsMax && (
            <InputError>
              You can only upload up to 20 files at a time
            </InputError>
          )}
          <Button
            disabled={uploadInProgress || noneSelected}
            onClick={handleRemoveAll}
          >
            Remove all
          </Button>
          {uploadFinished ? (
            <ButtonSolidBlue onClick={handleClose}>Close</ButtonSolidBlue>
          ) : (
            <ButtonSolidBlue
              type="submit"
              onClick={handleUpload}
              disabled={exceedsMax || uploadInProgress || noneSelected}
            >
              Upload
            </ButtonSolidBlue>
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
