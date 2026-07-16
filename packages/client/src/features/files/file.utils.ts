import type { DataNode } from 'rc-tree/lib/interface'
import type * as React from 'react'
import type { ServerScope } from '../home/types'
import type { ISpace } from '../spaces/spaces.types'
import type { OriginObject } from './files.types'

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

export type ReviewAreaCopyTarget = {
  scope: ServerScope
  label: string
  areaName: string
  modalTitle: string
  /** Matches the SpaceTypeTabs data-variant, so the button can reuse the area's colour. */
  variant: 'private' | 'shared'
}

/**
 * For a review space, returns the opposite area (shared area <-> the caller's
 * private/confidential area) as a copy destination. The serializer sets
 * private_space_id only in the shared area and shared_space_id only in a
 * private area, so at most one branch applies.
 */
export const getReviewAreaCopyTarget = (space?: ISpace): ReviewAreaCopyTarget | undefined => {
  if (space?.type !== 'review') return undefined
  const targetSpaceId = space.private_space_id ?? space.shared_space_id
  if (!targetSpaceId) return undefined
  const variant = space.private_space_id ? 'private' : 'shared'
  const areaName = variant === 'private' ? 'Private Area' : 'Shared Area'
  return {
    scope: `space-${targetSpaceId}`,
    label: `Copy to ${areaName}`,
    areaName,
    modalTitle: `Copy Files to "${space.name} - ${areaName}"`,
    variant,
  }
}

export const getOriginHref = (originObject?: OriginObject): string | null => {
  if (originObject?.originType == null || !originObject.originUid) {
    return null
  }

  switch (originObject.originType) {
    case 'Job':
      return `/home/executions/${originObject.originUid}`
    case 'Comparison':
      return `/home/comparisons/${originObject.originUid}`
    case 'UserFile':
    case 'Node':
      return `/home/files/${originObject.originUid}`
    case 'User':
    case 'Folder':
      return null
    default: {
      return originObject.originType
    }
  }
}
