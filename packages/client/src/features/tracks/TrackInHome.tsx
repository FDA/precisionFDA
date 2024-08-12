import React from 'react'
import { useParams } from 'react-router-dom'
import { getBaseLink } from '../apps/run/utils'
import { StyledBackLink } from '../home/home.styles'
import { ResourceHeader, HeaderLeft, HomeLoader, Title } from '../home/show.styles'
import {
  EntityIcon,
  EntityType,
  NotFoundEntity,
  TrackHelp,
  TrackIcon,
  TrackProvenanceContent,
  TrackProvenancePageParams,
  TrackWrapper,
  convertEntityLink,
  getEntityTypeFromIdentifier,
} from './TrackProvenanceContent'
import { useTrackProvenanceQuery } from './useTrackProvenanceQuery'

const BackLink = ({ spaceId, entityType, identifier }: { spaceId?: number; entityType: EntityType; identifier: string }) => {
  const linkTo = `/${getBaseLink(spaceId)}/${convertEntityLink(entityType, identifier)}`

  return <StyledBackLink linkTo={linkTo}>Back to {entityType}</StyledBackLink>
}

export const TrackInHome = ({ entityType, spaceId }: { entityType?: EntityType; spaceId?: number }) => {
  const identifier = useParams<TrackProvenancePageParams>()?.identifier
  if (!entityType) {
    entityType = getEntityTypeFromIdentifier(identifier!)
  }
  const { data, isLoading, isError } = useTrackProvenanceQuery(identifier!)
  if (isLoading) {
    return <HomeLoader />
  }

  return isError ? (
    <NotFoundEntity entityType={entityType} />
  ) : (
    <>
      <BackLink spaceId={spaceId} entityType={entityType} identifier={identifier!} />
      <ResourceHeader>
        <HeaderLeft>
          <Title data-testid={`${entityType}-title`}>
            <TrackIcon width={24} height={20} />
            Track
            <EntityIcon entityType={entityType} />
            &nbsp;{data?.name}
          </Title>
        </HeaderLeft>
      </ResourceHeader>
      <TrackWrapper>
        <TrackHelp />
        <TrackProvenanceContent svg={data?.svg ?? ''} />
      </TrackWrapper>
    </>
  )
}
