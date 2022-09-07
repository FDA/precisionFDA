import React, { useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'

import Modal from '../../Modal'
import Button from '../../Button'
import Input from '../../FormComponents/Input'


const Footer = ({ hideHandler, addFolderHandler, disableButton }) => {
  return (
    <>
      <Button onClick={hideHandler}>Cancel</Button>
      <Button type="primary" onClick={addFolderHandler} disabled={disableButton}>Create</Button>
    </>
  )
}

const AddFolderModal = ({ addFolderAction, hideAction, isOpen, isLoading }) => {
  const [folderName, setFolderName] = useState('')
  const changeFolderName = (e) => setFolderName(e.target.value)

  const hideHandler = () => {
    setFolderName('')
    hideAction()
  }

  const addFolderHandler = useCallback(
    () => addFolderAction(folderName),
    [folderName],
  )

  const enterKeyDownHandler = (e) => {
    if(e.key === 'Enter') { addFolderHandler() }
  }

  useEffect(() => {
    if (isOpen) setFolderName('')
  }, [isOpen])

  const disableButton = !folderName || !folderName.length

  return (
    <Modal
      isOpen={isOpen}
      isLoading={isLoading}
      title="Create new folder"
      modalFooterContent={<Footer hideHandler={hideHandler} addFolderHandler={addFolderHandler} disableButton={disableButton} />}
      hideModalHandler={hideHandler}
    >
      <Input
        title="Enter folder name"
        name="space-file-addFolder"
        placeholder="Enter Name..."
        value={folderName}
        onChange={changeFolderName}
        onKeyDown={enterKeyDownHandler}
        lg
        autoFocus
      />
    </Modal>
  )
}

export default AddFolderModal

AddFolderModal.propTypes = {
  addFolderAction: PropTypes.func,
  hideAction: PropTypes.func,
  isOpen: PropTypes.bool,
  isLoading: PropTypes.bool,
  defaultFolderName: PropTypes.string,
}

Footer.propTypes = {
  addFolderHandler: PropTypes.func,
  hideHandler: PropTypes.func,
  disableButton: PropTypes.bool,
}
