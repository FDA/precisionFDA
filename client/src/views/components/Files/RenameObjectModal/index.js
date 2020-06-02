import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'

import Modal from '../../Modal'
import Button from '../../Button'
import Input from '../../FormComponents/Input'


const Footer = ({ hideHandler, renameHandler, disableButton }) => {
  return (
    <>
      <Button onClick={hideHandler}>Cancel</Button>
      <Button type="primary" onClick={renameHandler} disabled={disableButton}>Rename</Button>
    </>
  )
}

const RenameObjectModal = ({ renameAction, hideAction, isOpen, isLoading, defaultFileName }) => {
  const [fileName, setFileName] = useState(defaultFileName)
  const changeFileName = (e) => setFileName(e.target.value)

  const hideHandler = () => {
    setFileName(defaultFileName)
    hideAction()
  }

  const renameHandler = useCallback(
    () => renameAction(fileName),
    [fileName],
  )

  const disableButton = !fileName || !fileName.length

  return (
    <Modal
      isOpen={isOpen}
      isLoading={isLoading}
      title="Rename"
      modalFooterContent={<Footer hideHandler={hideHandler} renameHandler={renameHandler} disableButton={disableButton} />}
      hideModalHandler={hideHandler}
    >
      <Input
        name="space-file-rename"
        placeholder="Rename..."
        value={fileName}
        onChange={changeFileName}
        lg
      />
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
}

Footer.propTypes = {
  renameHandler: PropTypes.func,
  hideHandler: PropTypes.func,
  disableButton: PropTypes.bool,
}
