import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import classnames from 'classnames'

import './FileList.sass'
import Icon from '../../../../views/components/Icon'
import { uploadModalFilesSelector } from '../selectors'
import { FILE_STATUS } from '../constants'


const uploadedSize = (file) => {
  return Math.ceil((file.uploadedSize / file.size) * 100)
}

const renderStatus = file => {
  const uploadedPercent = uploadedSize(file)

  switch (file.status) {
    case FILE_STATUS.ADDED:
      return 'Ready for upload'
    case FILE_STATUS.UPLOADING:
      return uploadedPercent > 0 ? `Uploading: ${uploadedPercent}%` : 'Uploading...'
    case FILE_STATUS.PREPARING:
      return 'Starting upload...'
    case FILE_STATUS.FINALIZING:
      return 'Finalizing...'
    case FILE_STATUS.UPLOADED:
      return 'Upload complete'
    case FILE_STATUS.FAILURE:
      return 'Failure'
  }
}

const renderActions = (file, onRemoveClick, onRetryClick) => {
  const buttons = []

  if (file.status === FILE_STATUS.FAILURE) {
    buttons.push(
      <button key="retry" className="btn btn-link file-list__file-action" onClick={() => onRetryClick(file.id)}>
        <Icon icon="fa-repeat" />
      </button>,
    )
  }

  if ([FILE_STATUS.ADDED, FILE_STATUS.FAILURE].includes(file.status)) {
    buttons.push(
      <button key="remove" className="btn btn-link file-list__file-action" onClick={() => onRemoveClick(file.id)}>
        <Icon icon="fa-trash" />
      </button>,
    )
  }

  return buttons
}

const File = ({ file, onRemoveClick, onRetryClick }) => {
  const rowClasses = classnames({
    'file-list__file': true,
    'file-list__file--success': file.status === FILE_STATUS.UPLOADED,
    'file-list__file--failure': file.status === FILE_STATUS.FAILURE,
  })

  return (
    <div className={rowClasses}>
      <div className="file-list__name">
        {file.name}
      </div>
      <div className="file-list__status">
        { renderStatus(file) }
      </div>
      <div className="file-list__actions">
        { renderActions(file, onRemoveClick, onRetryClick) }
      </div>
    </div>
  )
}

File.propTypes = {
  file: PropTypes.object.isRequired,
  onRemoveClick: PropTypes.func.isRequired,
  onRetryClick: PropTypes.func.isRequired,
}

const FilesList = ({ onRemoveClick, onRetryClick }) => {
  const files = useSelector(uploadModalFilesSelector)

  return (
    <div className="file-list">
      { files.map(file => (
          <File
            key={file.id}
            file={file}
            onRemoveClick={onRemoveClick}
            onRetryClick={onRetryClick}
          />
        ),
      ) }
    </div>
  )
}

FilesList.propTypes = {
  onRemoveClick: PropTypes.func.isRequired,
  onRetryClick: PropTypes.func.isRequired,
}

export default FilesList
