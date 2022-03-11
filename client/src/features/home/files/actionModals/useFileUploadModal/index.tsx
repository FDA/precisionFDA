import { all, any } from 'ramda'
import React, { useState } from 'react'
import Dropzone from 'react-dropzone'
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { useImmer } from 'use-immer'
import { Button, ButtonSolidBlue } from '../../../../../components/Button'
import { TransparentButton } from '../../../../../components/Dropdown/styles'
import { InputError } from '../../../../../components/form/styles'
import { TrashIcon } from '../../../../../components/icons/TrashIcon'
import { createSequenceGenerator } from '../../../../../utils'
import { Modal } from '../../../../modal'
import { ButtonRow, Footer, ModalScroll } from '../../../../modal/styles'
import { useModal } from '../../../../modal/useModal'
import { ResourceScope } from '../../../types'
import { uploadFilesRequest } from '../../files.api'
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

export const useFileUploadModal = ({
  scope,
  folderId,
}: {
  scope?: ResourceScope
  folderId?: string
}) => {
  const queryCache = useQueryClient()
  const { isShown, setShowModal } = useModal()
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
  const uploadFinished = filesMeta.length > 0 && all(s => [FILE_STATUS['uploaded']].includes(s), statuses)
  const exceedsMax = filesMeta.length > MAX_UPLOADABLE_FILES
  const noneSelected = filesMeta.length === 0

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

  const handleRetryFile = (id: string) => {}

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
        filesMeta: filesMeta,
        updateFileStatus: updateFilesStatus,
        spaceId: 1,
        scope: scope === 'me' ? 'private' : scope === 'everybody' ? 'public' : scope,
        folderId,
      })
      toast.success('Success: uploading files')
    } catch (error) {
      toast.error('Error: uploading files')
    }
    await queryCache.invalidateQueries('files')
  }
  
  const modalComp = (
    <Modal
      data-testid="modal-files-upload"
      headerText={`Upload files to ${folderId ? 'folder' : 'root'}`}
      isShown={isShown}
      hide={() => handleClose()}
    >
      <StyledDropSection>
        <ButtonSolidBlue disabled={uploadInProgress}>
          <Dropzone
            noDrag={true}
            disabled={uploadInProgress}
            maxSize={MAX_UPLOADABLE_FILE_SIZE}
            onDropAccepted={accepted => {
              const uniqBlob: any[] = []
              const fil: any[] = []
              accepted.forEach((file: any) => {
                if (isUniqFile(blobs, file)) {
                  file.generatedId = idGenerator.next().value
                  uniqBlob.push(file)
                  fil.push({
                    id: file.generatedId,
                    name: file.name,
                    size: file.size,
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
      {filesMeta.length > 0 && (
        <ModalScroll>
          <UploadFilesTable>
            <thead>
              <tr>
                <td>Name</td>
                <Status>Status</Status>
                <Remove>Remove</Remove>
              </tr>
            </thead>
            <tbody>
              {filesMeta.map((f, i) => (
                <tr key={i}>
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
        </ModalScroll>
      )}
      <Footer>
        <ButtonRow>
          <div>{filesMeta.length} Files Selected</div>
          {exceedsMax && (
            <InputError>
              You can only upload up to 20 files at a time
            </InputError>
          )}
          <Button disabled={uploadInProgress || noneSelected} onClick={() => handleRemoveAll()}>
            Remove all
          </Button>
          {uploadFinished ? (
            <ButtonSolidBlue onClick={() => handleClose()}>
              Close
            </ButtonSolidBlue>
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
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
  }
}
