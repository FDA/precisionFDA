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

const openableExtensions = new Set([
  'pdf',
  'txt',
  'json',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg',
  'dot',
  'rtf',
  'html',
  'htm',
  'xml',
  'md',
  'log',
  'err',
  'out',
  'csv',
  'tsv',
  'webp',
  'bmp',
  'ico',
  'mp3',
  'wav',
  'ogg',
  'mp4',
  'webm',
  'js',
  'css',
  'py',
  'rb',
  'sh',
  'yaml',
  'yml',
])

export const isOpenable = (fileName: string): boolean => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  return ext ? openableExtensions.has(ext) : false
}
