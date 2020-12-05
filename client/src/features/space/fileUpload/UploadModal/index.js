import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Dropzone from 'react-dropzone'
import { all, any, reject } from 'ramda'

import Modal from '../../../../views/components/Modal'
import {
  uploadModalFilesSelector,
  uploadModalShownSelector,
} from '../selectors'
import {
  addFile,
  hideUploadModal,
  removeAllFiles,
  removeFile,
  retryFile,
  uploadFiles,
} from '../actions'
import Button from '../../../../views/components/Button'
import Icon from '../../../../views/components/Icon'
import './style.sass'
import FilesList from './FilesList'
import { createSequenceGenerator, getQueryParam } from '../../../../utils'
import { FILE_STATUS, MAX_UPLOADABLE_FILE_SIZE, MAX_UPLOADABLE_FILES } from '../constants'
import { spaceDataSelector } from '../../../../reducers/spaces/space/selectors'


const idGenerator = createSequenceGenerator()

const uploadAcceptedFiles = (dispatch, files, spaceId, folderId) => {
  dispatch(uploadFiles(files, spaceId, folderId))
}

const Footer = ({ dispatch, files, blobs, setBlobs, spaceId, uploadDisabled, uploadInProgress }) => {
  const allUploaded = files.length && all(file => file.status === FILE_STATUS.UPLOADED)(files)
  const location = useLocation('folderId')
  const folderId = parseInt(getQueryParam(location.search, 'folderId'))

  if (allUploaded) {
    return (
      <div>
        <Button
          type="primary"
          onClick={() => {
            dispatch(hideUploadModal())
            setBlobs([])
          }}
        >Close</Button>
      </div>
    )
  } else {
    return (
      <div>
        <Button
          type="default"
          disabled={uploadInProgress}
          onClick={() => {
            dispatch(hideUploadModal())
            setBlobs([])
          }}>Cancel</Button>
        <Button
          type="primary"
          disabled={uploadDisabled}
          onClick={() => uploadAcceptedFiles(dispatch, blobs, spaceId, folderId)}
        >Upload</Button>
      </div>
    )
  }
}

Footer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  files: PropTypes.array.isRequired,
  blobs: PropTypes.array.isRequired,
  setBlobs: PropTypes.func.isRequired,
  spaceId: PropTypes.number,
  uploadInProgress: PropTypes.bool,
}

const isUniqFile = (blobs, file) => (
  !blobs.find(blob => (
    blob.name === file.name &&
    blob.lastModified === file.lastModified &&
    blob.size === file.size &&
    blob.type === file.type &&
    blob.path === file.path
  ))
)

const UploadModal = () => {
  const dispatch = useDispatch()
  const [blobs, setBlobs] = useState([])
  const isOpen = useSelector(uploadModalShownSelector)
  const files = useSelector(uploadModalFilesSelector)
  const space = useSelector(spaceDataSelector)

  const onRemoveClick = (id) => {
    setBlobs(reject(file => file.generatedId === id, blobs))
    dispatch(removeFile({ id }))
  }

  const onRetryClick = (id) => {
    dispatch(retryFile({ id }))
  }

  const statuses = files.map(file => file.status)

  const addedFilesPresent = any(status => status === FILE_STATUS.ADDED, statuses)

  const uploadInProgress = any(
    status => [FILE_STATUS.PREPARING, FILE_STATUS.UPLOADING, FILE_STATUS.FINALIZING].includes(status),
    statuses,
  )

  const selectDisabled = files.length >= MAX_UPLOADABLE_FILES || uploadInProgress

  const uploadDisabled = files.length > MAX_UPLOADABLE_FILES || uploadInProgress || !addedFilesPresent

  return(
    <Modal
      className="upload-modal"
      isOpen={isOpen}
      hideModalHandler={() => dispatch(hideUploadModal())}
      title={`Upload files to ${space.isPrivate ? 'Private' : 'Shared'} Area`}
      subTitle={`You can upload up to ${MAX_UPLOADABLE_FILES} files in a time`}
      noPadding={true}
      shouldCloseOnOverlayClick={!uploadInProgress}
      shouldCloseOnEsc={!uploadInProgress}
      modalFooterContent={
        <Footer
          dispatch={dispatch}
          blobs={blobs}
          files={files}
          setBlobs={setBlobs}
          spaceId={space.id}
          uploadDisabled={uploadDisabled}
          uploadInProgress={uploadInProgress}
        />
      }
    >
      <div className="browse-button__container">
        <Button type="primary" size="lg" disabled={selectDisabled}>
          <>
            <Dropzone
              noDrag={true}
              disabled={selectDisabled}
              maxSize={MAX_UPLOADABLE_FILE_SIZE}
              onDropAccepted={(accepted) => {
              const uniq = []

              accepted.forEach(file => {
                if (isUniqFile(blobs, file)) {
                  file.generatedId = idGenerator.next().value
                  uniq.push(file)
                  dispatch(addFile({ id: file.generatedId, name: file.name, size: file.size }))
                }
              })

              setBlobs([...blobs, ...uniq])
            }}>
              {
                ({ getRootProps, getInputProps }) => (
                  <div {...getRootProps()} className="upload-modal__dropzone">
                    <input {...getInputProps()} />
                  </div>
                )
              }
            </Dropzone>
            <Icon icon="fa-copy" />
            <span className="browse-button__text">Browse files for upload...</span>
          </>
        </Button>
      </div>

      <div className="upload-modal__selected-files">
        <div className="upload-modal__selected-files-count">
          {`${files.length} ${files.length === 1 ? 'FILE' : 'FILES'} SELECTED`}
        </div>
        <button
          disabled={!files.length || uploadInProgress}
          className="btn btn-link upload-modal__remove-all"
          onClick={() => {
            setBlobs([])
            dispatch(removeAllFiles())
          }}
        >
          Remove all
        </button>
      </div>
      <div className="upload-modal__files-container">
        <FilesList onRemoveClick={onRemoveClick} onRetryClick={onRetryClick}/>
      </div>
    </Modal>
  )
}

export default UploadModal
