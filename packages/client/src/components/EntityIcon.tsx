import React from 'react'
import { AreaChartIcon } from './icons/AreaChartIcon'
import { CogsIcon } from './icons/Cogs'
import { CubeIcon } from './icons/CubeIcon'
import { DatabaseIcon } from './icons/DatabaseIcon'
import { FileIcon } from './icons/FileIcon'
import { FileZipIcon } from './icons/FileZipIcon'
import { StickyNoteIcon } from './icons/StickyNote'

export type EntityType = 'file' | 'app' | 'job' | 'database' | 'comparison' | 'note' | 'asset'

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
    default:
      return null
  }
}
