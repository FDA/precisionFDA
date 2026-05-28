import React from 'react'
import { AreaChartIcon } from './AreaChartIcon'
import { CogsIcon } from './Cogs'
import { CubeIcon } from './CubeIcon'
import { DatabaseIcon } from './DatabaseIcon'
import { FileIcon } from './FileIcon'
import { FileZipIcon } from './FileZipIcon'
import { StickyNoteIcon } from './StickyNote'
import { FolderIcon } from './FolderIcon'

export type EntityType = 'file' | 'app' | 'job' | 'database' | 'comparison' | 'note' | 'asset' | 'folder'

export const EntityIcon = ({ entityType }: { entityType: EntityType }) => {
  switch (entityType) {
    case 'app':
      return <CubeIcon height={20} />
    case 'database':
      return <DatabaseIcon height={20} />
    case 'file':
      return <FileIcon height={22} />
    case 'job':
      return <CogsIcon height={24} />
    case 'comparison':
      return <AreaChartIcon width={36} height={30} />
    case 'note':
      return <StickyNoteIcon width={30} height={30} />
    case 'asset':
      return <FileZipIcon height={22} />
    case 'folder':
      return <FolderIcon height={22} />
    default:
      return null
  }
}
