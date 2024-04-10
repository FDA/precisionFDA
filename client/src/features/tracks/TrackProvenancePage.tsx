import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components'
import {
  Help,
} from '../apps/form/styles'
import { StyledBackLink } from '../home/home.styles'
import { getBaseLink } from '../apps/run/utils'
import { Header, HeaderLeft, HomeLoader, NotFound, Title } from '../home/show.styles'
import { CubeIcon } from '../../components/icons/CubeIcon'
import { FileIcon } from '../../components/icons/FileIcon'
import { CogsIcon } from '../../components/icons/Cogs'
import { fetchProvenanceByUid } from './api'
import { SitemapIcon } from '../../components/icons/SitemapIcon'

type EntityType = 'file' | 'app' | 'execution'
type EntityUidKey = 'fileUid' | 'appUid' | 'executionUid'
type ProvenancePageParams = {
  [key in EntityUidKey]?: string
}

const TrackCanvas = styled.div`
  padding: 16px;
  text-align: center;
  overflow-x: auto;
  border: 1px solid var(--c-layout-border);
  border-radius: 3px;
  display: flex;
  justify-content: center;
  * {
    font-family: "Lato", "Helvetica Neue", Helvetica, Arial, sans-serif !important;
  }
  svg {
    display: unset;
  }
`

const TrackWrapper = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Capitalized = styled.span`
  text-transform: capitalize;
`

const EntityIcon = ({ entityType }: { entityType: EntityType }) => {
  switch (entityType) {
    case 'file':
      return <FileIcon height={22} />
    case 'app':
      return <CubeIcon height={20} />
    case 'execution':
      return <CogsIcon height={24} />
    default:
      return null
  }
}

export const TrackProvenancePage = ({ entityType, spaceId }: { entityType: EntityType, spaceId?: number }) => {
  const params = useParams<ProvenancePageParams>()
  const keyMap: Record<EntityType, EntityUidKey> = {
    file: 'fileUid',
    app: 'appUid',
    execution: 'executionUid',
  }
  const uid = params[keyMap[entityType]] as string
  const { data, isLoading, isError } = useQuery({
    queryKey: [entityType, uid, 'provenance'],
    queryFn: () => fetchProvenanceByUid(uid),
  })

  if (isLoading) {
    return <HomeLoader />
  }

  return isError ? (
    <NotFound>
      <h1><Capitalized>{entityType}</Capitalized> not found</h1>
      <div>Sorry, this {entityType} does not exist or is not accessible by you.</div>
    </NotFound>
  ) : (
    <>
      <StyledBackLink
        linkTo={`/${getBaseLink(spaceId)}/${entityType}s/${uid}`}
      >
        Back to {entityType}
      </StyledBackLink>
      <TrackWrapper>
        <Header>
          <HeaderLeft>
            <Title
              data-testid={`${entityType}-title`}>
              <SitemapIcon width={24} height={20} style={{ transform: 'rotate(180deg)' }} />
              Track
              <EntityIcon entityType={entityType} />
              &nbsp;{data?.name}
            </Title>
          </HeaderLeft>
        </Header>
        <Help>
          <span>Need help?</span>
          <Link to="/docs/tracking" target="_blank">
            &nbsp;Learn more about tracking
          </Link>
        </Help>
        <TrackCanvas dangerouslySetInnerHTML={{ __html: data?.svg ?? '' }} />
      </TrackWrapper>
    </>
  )
}