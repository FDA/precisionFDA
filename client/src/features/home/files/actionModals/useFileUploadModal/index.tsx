/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable dot-notation */
import { all, any } from 'ramda'
import React, { useEffect, useState } from 'react'
import Dropzone from 'react-dropzone'
import { useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { useImmer } from 'use-immer'
import { Button, ButtonSolidBlue } from '../../../../../components/Button'
import { TransparentButton } from '../../../../../components/Dropdown/styles'
import { InputError } from '../../../../../components/form/styles'
import { TrashIcon } from '../../../../../components/icons/TrashIcon'
import { createSequenceGenerator } from '../../../../../utils'
import { Modal } from '../../../../modal'
import { ButtonRow, Footer, ModalScroll } from '../../../../modal/styles'
import { useConditionalModal } from '../../../../modal/useModal'
import { ResourceScope } from '../../../types'
import { itemsCountString } from '../../../../../utils/formatting'
import {
  FilesMeta,
  FILE_STATUS,
  IUploadInfo,
  MAX_UPLOADABLE_FILES,
  MAX_UPLOADABLE_FILE_SIZE,
} from './constants'
import { multiFileUpload } from './multiFileUpload'
import {
  Remove,
  Status,
  StyledDropSection,
  SubTitle,
  UploadFilesTable,
} from './styles'

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

  useEffect(() => {
    if (uploadFinished) {
      toast.success(
        `Success: uploaded ${itemsCountString('file', filesMeta.length)}`,
      )
      queryCache.invalidateQueries('files')
      queryCache.invalidateQueries('counters')
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

  const modalComp = (
    <Modal
      data-testid="modal-files-upload"
      headerText={`Upload files to ${folderId ? 'folder' : 'root'}`}
      isShown={isShown}
      hide={() => handleClose()}
      title="Modal dialog to upload files"
      header={
        <StyledDropSection>
          <ButtonSolidBlue disabled={uploadInProgress}>
            <Dropzone
              noDrag
              disabled={uploadInProgress}
              maxSize={MAX_UPLOADABLE_FILE_SIZE}
              onDropAccepted={accepted => {
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
              }}
            >
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps()} className="upload-modal__dropzone">
                  <input {...getInputProps()} />
                </div>
              )}
            </Dropzone>
            <span>Browse files for upload...</span>
          </ButtonSolidBlue>
          <SubTitle>You can upload up to 20 files at a time</SubTitle>
        </StyledDropSection>
      }
      footer={
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
      }
    >
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
    </Modal>
  )

  return {
    modalComp,
    setShowModal,
  }
}
