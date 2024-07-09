import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { AreaChartIcon } from '../../components/icons/AreaChartIcon'
import { CogsIcon } from '../../components/icons/Cogs'
import { CubeIcon } from '../../components/icons/CubeIcon'
import { DatabaseIcon } from '../../components/icons/DatabaseIcon'
import { FileIcon } from '../../components/icons/FileIcon'
import { SitemapIcon } from '../../components/icons/SitemapIcon'
import { StickyNoteIcon } from '../../components/icons/StickyNote'
import { Help } from '../apps/form/styles'
import { NotFound } from '../home/show.styles'

export type EntityType = 'file' | 'app' | 'execution' | 'database' | 'comparison' | 'note'
export type TrackProvenancePageParams = {
  identifier: string
}

export const EntityIcon = ({ entityType }: { entityType: EntityType }) => {
  switch (entityType) {
    case 'app':
      return <CubeIcon height={20} />
    case 'database':
      return <DatabaseIcon height={20} />
    case 'file':
      return <FileIcon height={22} />
    case 'execution':
      return <CogsIcon height={24} />
    case 'comparison':
      return <AreaChartIcon width={36} height={30} />
    case 'note':
      return <StickyNoteIcon width={30} height={30} />
    default:
      return null
  }
}

const Capitalized = styled.span`
  text-transform: capitalize;
`

const TrackCanvas = styled.div`
  padding: 16px;
  text-align: center;
  overflow-x: scroll;
  border: 1px solid var(--c-layout-border);
  border-radius: 3px;
  * {
    font-size: 12px;
    font-family: 'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
  }
  svg {
    display: unset;
    max-width: unset;
  }

  .node .content svg {
    height: 13px;
  }
  .node a {
    height: 36px;
    padding: 8px;
    font-size: 12px;
  }
`

export const TrackWrapper = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const TrackIcon = styled(SitemapIcon)`
  transform: rotate(180deg);
`

export const TrackHelp = () => {
  return (
    <Help>
      <span>Need help?</span>
      <Link to="/docs/tracking" target="_blank">
        &nbsp;Learn more about tracking
      </Link>
    </Help>
  )
}

export const NotFoundEntity = ({ entityType }: { entityType: EntityType }) => {
  return (
    <NotFound>
      <h1>
        <Capitalized>{entityType}</Capitalized> not found
      </h1>
      <div>Sorry, this {entityType} does not exist or is not accessible by you.</div>
    </NotFound>
  )
}

export const TrackProvenanceContent = ({ svg }: { svg: string }) => {
  return <TrackCanvas dangerouslySetInnerHTML={{ __html: svg }} />
}

export const convertEntityLink = (entityType: EntityType, uid: string) => {
  let entityIdentifier = uid
  const splittedUid = uid.split('-')
  switch (entityType) {
    case 'comparison':
    case 'note':
      entityIdentifier = splittedUid[1]
      break
  }
  return `${entityType}s/${entityIdentifier}`
}

export const getEntityTypeFromIdentifier = (identifier: string): EntityType => {
  return identifier.split('-')[0] as EntityType
}
