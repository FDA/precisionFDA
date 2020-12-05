import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import classNames from 'classnames/bind'

import Button from '../../../Button'
import Icon from '../../../Icon'
import {
  spaceFilesSelector,
  spaceFilesLinksSelector,
} from '../../../../../reducers/spaces/files/selectors'
import {
  showFilesActionModal,
  showFilesRenameModal,
  showFilesCopyModal,
} from '../../../../../actions/spaces/files'
import { SPACE_FILES_ACTIONS } from '../../../../../constants'
import ActionModal from '../ActionModal'
import RenameModal from '../RenameModal'
import CopyModal from '../CopyModal'
import { showMoveModal } from '../MoveModal/actions'


const Divider = () => (<li role="separator" className="divider" />)

const Item = ({ text, icon, isDisabled, handler }) => {
  const classes = classNames({
    'dropdown-menu__item--disabled': isDisabled,
  }, 'dropdown-menu__item')

  const onClick = () => {
    if (!isDisabled && typeof handler === 'function') handler()
  }

  return (
    <li className={classes} onClick={onClick}>
      <Icon icon={icon} />&nbsp;
      {text}
    </li>
  )
}

const ActionsDropdown = ({ loadFilesHandler }) => {
  const files = useSelector(spaceFilesSelector)
  const links = useSelector(spaceFilesLinksSelector)
  const dispatch = useDispatch()
  const checkedFiles = files.filter((file) => file.isChecked)
  const currentFile = (checkedFiles.length === 1) ? checkedFiles[0] : null

  const showPublishModal = () => dispatch(showFilesActionModal(SPACE_FILES_ACTIONS.PUBLISH))
  const showDownloadModal = () => dispatch(showFilesActionModal(SPACE_FILES_ACTIONS.DOWNLOAD))
  const showDeleteModal = () => dispatch(showFilesActionModal(SPACE_FILES_ACTIONS.DELETE))
  const showCopyToPrivateModal = () => {
    dispatch(showFilesActionModal(SPACE_FILES_ACTIONS.COPY_TO_PRIVATE))
  }
  const showFilesMoveModal = () => dispatch(showMoveModal())
  const showCopyModal = () => dispatch(showFilesCopyModal())
  const showRenameModal = useCallback(
    () => {
      if (currentFile) return dispatch(showFilesRenameModal())
    },
    [currentFile],
  )

  const isAnyFileChecked = checkedFiles.length > 0

  const disableRename = checkedFiles.length > 1 || !currentFile || !currentFile.links.renamePath

  return (
    <div className="btn-group">
      <div className="dropdown">
        <Button type="primary" id="space_files_actions" data-toggle="dropdown">
          <Icon icon="fa-cog" />
        </Button>
        <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="space_files_actions">
          <Item isDisabled={!isAnyFileChecked || disableRename}
            icon="fa-pencil" text="Rename" handler={showRenameModal} />
          <Divider />
          <Item isDisabled={!isAnyFileChecked || !links.move}
            icon="fa-share" text="Move To Folder" handler={showFilesMoveModal}/>
          <Divider />
          <Item isDisabled={!isAnyFileChecked || !links.copy}
            icon="fa-clone" text="Copy To Space" handler={showCopyModal} />
          <Divider />
          <Item isDisabled={!isAnyFileChecked || !links.copy_private}
            icon="fa-lock" text="Copy To Private" handler={showCopyToPrivateModal} />
          <Divider />
          <Item isDisabled={!isAnyFileChecked || !links.publish}
            icon="fa-bullhorn" text="Publish" handler={showPublishModal} />
          <Divider />
          <Item isDisabled={!isAnyFileChecked || !links.remove}
            icon="fa-trash" text="Delete" handler={showDeleteModal} />
          <Divider />
          <Item isDisabled={!isAnyFileChecked}
            icon="fa-download" text="Download" handler={showDownloadModal} />
        </ul>
      </div>
      <ActionModal files={checkedFiles} loadFilesHandler={loadFilesHandler} />
      <CopyModal files={checkedFiles} loadFilesHandler={loadFilesHandler} />
      {(currentFile) && <RenameModal file={currentFile} loadFilesHandler={loadFilesHandler} />}
    </div>
  )
}

export default ActionsDropdown

ActionsDropdown.propTypes = {
  loadFilesHandler: PropTypes.func,
}

Item.propTypes = {
  isDisabled: PropTypes.bool,
  text: PropTypes.string,
  icon: PropTypes.string,
  handler: PropTypes.func,
}
