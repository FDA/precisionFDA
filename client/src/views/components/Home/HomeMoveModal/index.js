import React, { useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import Modal from '../../Modal'
import Button from '../../Button'
import {
  homeFilesModalSelector,
} from '../../../../reducers/home/files/selectors'
import { fetchSubfolders } from '../../../../actions/home'
import FileTree from '../../Space/Files/FileTree'


const HomeMoveModal = ({ hideAction, isOpen, isLoading, modal = {}, fetchSubfolders, moveAction, scope }) => {
  const folders = modal.nodes
  const [targetId, setTargetId] = useState(null)

  const footer = () => (
    <>
      <Button type='primary' onClick={() => moveAction(targetId)} disabled={targetId === null}>Move</Button>
      <Button onClick={hideAction}>Cancel</Button>
    </>
  )

  const onFolderSelect = (keyArray) => {
    const id = keyArray.length ? keyArray[0] : null
    setTargetId(id)
  }

  return (
    <Modal
      isOpen={isOpen}
      modalFooterContent={footer()}
      title='Choose a folder to move selected items into'
      isLoading={isLoading}
      hideModalHandler={hideAction}>
      <FileTree
        loadData={(node) => fetchSubfolders(node.key, scope)}
        treeData={folders}
        onSelect={onFolderSelect}
      />
    </Modal>
  )
}


HomeMoveModal.propTypes = {
  hideAction: PropTypes.func,
  isOpen: PropTypes.bool,
  isLoading: PropTypes.bool,
  title: PropTypes.string,
  modal: PropTypes.object,
  fetchSubfolders: PropTypes.func,
  moveAction: PropTypes.func,
  scope: PropTypes.string,
}

const mapStateToProps = (state) => ({
  modal: homeFilesModalSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchSubfolders: (key, scope) => dispatch(fetchSubfolders(key, scope)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeMoveModal)

export {
  HomeMoveModal,
}
