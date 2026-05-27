import * as React from 'react'
import { DataNode } from 'rc-tree/lib/interface'
import type { OriginObject } from './files.types'

const assertNever = (_value: never): string | null => null

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

export const getOriginHref = (originObject?: OriginObject): string | null => {
  if (originObject?.originType == null || !originObject.originUid) {
    return null
  }

  switch (originObject.originType) {
    case 'Job':
      return `/jobs/${originObject.originUid}`
    case 'Comparison':
      return `/home/comparisons/${originObject.originUid}`
    case 'UserFile':
    case 'Node':
      return `/home/files/${originObject.originUid}`
    case 'User':
    case 'Folder':
      return null
    default:
      return assertNever(originObject.originType)
  }
}

