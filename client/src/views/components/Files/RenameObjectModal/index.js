import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'

import Modal from '../../Modal'
import Button from '../../Button'
import Input from '../../FormComponents/Input'


const Footer = ({ hideHandler, renameHandler, disableButton, isFolder }) => {
  return (
    <>
      <Button onClick={hideHandler}>Cancel</Button>
      <Button type="primary" onClick={renameHandler} disabled={disableButton}>{isFolder ? 'Rename' : 'Save'}</Button>
    </>
  )
}

const RenameObjectModal = ({ renameAction, hideAction, isOpen, isLoading, defaultFileName, defaultFileDescription, isFolder }) => {
  const [fileName, setFileName] = useState(defaultFileName)
  const changeFileName = (e) => setFileName(e.target.value)
  
  const [fileDescription, setFileDescription] = useState(defaultFileDescription)
  const changeFileDescription = (e) => setFileDescription(e.target.value)

  const hideHandler = () => {
    setFileName(defaultFileName)
    setFileDescription(defaultFileDescription)
    hideAction()
  }

  const renameHandler = useCallback(
    () => renameAction(fileName, fileDescription),
    [fileName, fileDescription],
  )

  const enterKeyDownHandler = (e) => {
    if(e.key === 'Enter') { renameHandler() }
  }
  
  const disableButton = !fileName || !fileName.length
  const title = `Edit ${isFolder ? 'Folder' : 'File'} Info`
  return (
    <Modal
      isOpen={isOpen}
      isLoading={isLoading}
      title={title}
      modalFooterContent={<Footer hideHandler={hideHandler} renameHandler={renameHandler} disableButton={disableButton} isFolder={isFolder}/>}
      hideModalHandler={hideHandler}
    >
      <>
        <div className="form-group">
          <label className="control-label">{isFolder ? 'Folder Name' : 'File Name'}</label>
          <Input
            name="space-file-rename"
            placeholder="Rename..."
            value={fileName}
            onChange={changeFileName}
            onKeyDown={enterKeyDownHandler}
            autoFocus
            lg
          />
        </div>
        {
          !isFolder &&
            <div className="form-group">
              <label className="control-label">Description</label>
              <Input
                name="space-file-description"
                placeholder="Description"
                value={fileDescription}
                onChange={changeFileDescription}
                onKeyDown={enterKeyDownHandler}
                autoFocus
                lg
              />
            </div>
        }
      </>
    </Modal>
  )
}

export default RenameObjectModal

RenameObjectModal.propTypes = {
  renameAction: PropTypes.func,
  hideAction: PropTypes.func,
  isOpen: PropTypes.bool,
  isLoading: PropTypes.bool,
  defaultFileName: PropTypes.string,
  defaultFileDescription: PropTypes.string,
  isFolder: PropTypes.bool,
}

Footer.propTypes = {
  renameHandler: PropTypes.func,
  hideHandler: PropTypes.func,
  disableButton: PropTypes.bool,
  isFolder: PropTypes.bool,
}
