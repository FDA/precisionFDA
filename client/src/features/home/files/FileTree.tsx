import React from 'react'
import Tree, { TreeProps } from 'rc-tree'
import {FolderIcon} from '../../../components/icons/FolderIcon'
import { FolderOpenIcon} from '../../../components/icons/FolderOpenIcon'
import { DataNode } from 'rc-tree/lib/interface'
import { TreeStyles } from './FileList.styles'

const Icon = ({ loading, expanded, isLeaf }: { loading:boolean, expanded:boolean, isLeaf:boolean }) => {
  let IconState = isLeaf ? FolderIcon : FolderIcon

  if (!isLeaf && loading) {
    IconState = FolderIcon
  } else if (!isLeaf && expanded) {
    IconState = FolderOpenIcon
  }

  return <IconState height={14}/>
}

export const FileTree = (props: Omit<TreeProps, 'prefixCls'>) => {
  const treeRef = React.createRef<Tree<DataNode>>();
  
  return (
    <TreeStyles>
      <Tree
        ref={treeRef}
        showLine={true}
        autoExpandParent={true}
        icon={Icon}
        {...props}
      />
    </TreeStyles>
  )
}
