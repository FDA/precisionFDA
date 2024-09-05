import * as React from 'react'
import { DataNode } from 'rc-tree/lib/interface'

export function findById(tree: DataNode[], nodeId: React.Key): DataNode | null {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]
    if (node.key === nodeId) {
      return node
    }
    if (node.children) {
      const result = findById(node.children, nodeId)
      if (result) {
        return result
      }
    }
  }
  return null
}

export const noAccessText = {
  multi: 'One or more files are not accessible',
  single: 'This file is not accessible',
}
