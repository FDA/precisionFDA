import React from 'react'
import Tree from 'rc-tree'
import 'rc-tree/assets/index.css'
import { FolderIcon } from '../../components/icons/FolderIcon'
import { FolderOpenIcon } from '../../components/icons/FolderOpenIcon'
import { TreeStyles } from './FileList.styles'
import { FileIcon } from '../../components/icons/FileIcon'
import { FileTreeNode } from './files.types'

const Icon = ({
  loading,
  expanded,
  isLeaf,
}: {
  loading: boolean
  expanded: boolean
  isLeaf: boolean
}) => {
  let IconState = isLeaf ? FolderIcon : FolderIcon

  if (!isLeaf && loading) {
    IconState = FolderIcon
  } else if (!isLeaf && expanded) {
    IconState = FolderOpenIcon
  }
  if(isLeaf) {
    IconState = FileIcon
  }

  return <IconState height={14} />
}

export const FileTree = (props: Omit<FileTreeNode, 'prefixCls'>) => {
  const treeRef = React.createRef<Tree<FileTreeNode>>()

  return (
    <TreeStyles>
      <Tree
        ref={treeRef}
        showLine
        autoExpandParent
        icon={Icon}
        {...props}
      />
    </TreeStyles>
  )
}
