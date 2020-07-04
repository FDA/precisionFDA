import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'

import Modal from '../../../Modal'
import Button from '../../../Button'
import {
  spaceFilesMoveModalSelector,
  spaceFilesSelector,
} from '../../../../../reducers/spaces/files/selectors'
import { fetchSubfolders, filesMove, hideMoveModal } from './actions'
import FileTree from '../FileTree'


const MoveModal = ({ space, currentFolderId }) => {
  const dispatch = useDispatch()
  const modal = useSelector(spaceFilesMoveModalSelector)
  const folders = modal.nodes
  const [targetId, setTargetId] = useState(null)
  const nodes = useSelector(spaceFilesSelector)

  const loadFolders = (node) => {
    return dispatch(fetchSubfolders(space.id, node.key))
  }

  const onMoveClick = () => {
    const nodesIds = []

    nodes.forEach(node => {
      if (node.isChecked) {
        nodesIds.push(node.id)
      }
    })

    dispatch(filesMove(space.id, nodesIds, targetId, currentFolderId))
  }

  const onCancelClick = () => {
    dispatch(hideMoveModal())
  }

  const onFolderSelect = (_, event) => {
    const { selected } = event
    const target = selected ? event.node.key : null

    setTargetId(target)
  }

  const footer = () => (
    <>
      <Button type="primary" onClick={onMoveClick} disabled={targetId === null}>Move</Button>
      <Button onClick={onCancelClick}>Cancel</Button>
    </>
  )

  return(
    <Modal isOpen={modal.isOpen} modalFooterContent={footer()} title="Chose a folder to move selected items into">
      <FileTree
        loadData={loadFolders}
        treeData={folders}
        onSelect={onFolderSelect}
      />
    </Modal>
  )
}

MoveModal.propTypes = {
  space: PropTypes.object,
  currentFolderId: PropTypes.number,
}

export default MoveModal
