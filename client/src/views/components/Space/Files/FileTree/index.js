import React from 'react'
import Tree from 'rc-tree/lib'
import 'rc-tree/assets/index.css'
import PropTypes from 'prop-types'

import Icon from '../../../Icon'
import './style.sass'


const FolderIcon = ({ loading, expanded, isLeaf }) => {
  let icon = isLeaf ? 'fa-file-o' : 'fa-folder'

  if (!isLeaf && loading) {
    icon = 'fa-spinner fa-spin'
  } else if (!isLeaf && expanded) {
    icon = 'fa-folder-open'
  }

  return <Icon icon={icon} cssClasses="folder-icon" />
}

FolderIcon.propTypes = {
  loading: PropTypes.bool,
  expanded: PropTypes.bool,
  isLeaf: PropTypes.bool,
}

const FileTree = (props) => (
  <Tree
    showLine={true}
    autoExpandParent={true}
    icon={FolderIcon}
    {...props}
  />
)

export default FileTree
