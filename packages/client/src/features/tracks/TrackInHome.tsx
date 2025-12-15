import React from 'react'
import { useParams } from 'react-router'
import { getBaseLink } from '../apps/run/utils'
import { StyledBackLink } from '../home/home.styles'
import { defaultHomeContext, HomeScopeContextValue } from '../home/HomeScopeContext'
import { HeaderLeft, HomeLoader, ResourceHeader, Title } from '../home/show.styles'
import { useHomeDisplayScope } from '../home/useHomeDisplayScope'
import {
  convertEntityLink,
  EntityIcon,
  EntityType,
  getEntityTypeFromIdentifier,
  NotFoundEntity,
  TrackHelp,
  TrackIcon,
  TrackProvenanceContent,
  TrackProvenancePageParams,
  TrackWrapper,
} from './TrackProvenanceContent'
import { useTrackProvenanceQuery } from './useTrackProvenanceQuery'
import { useEntityScopeQuery } from './useEntityScopeQuery'

const BackLink = ({ spaceId, entityType, identifier }: { spaceId?: number; entityType: EntityType; identifier: string }) => {
  const linkTo = `/${getBaseLink(spaceId)}/${convertEntityLink(entityType, identifier)}`

  return <StyledBackLink linkTo={linkTo}>Back to {entityType}</StyledBackLink>
}

export const TrackInHome = ({
  entityType,
  spaceId,
  homeContext = defaultHomeContext,
}: {
  entityType?: EntityType
  spaceId?: number
  homeContext?: HomeScopeContextValue
}) => {
  const identifier = useParams<TrackProvenancePageParams>()?.identifier
  const resolvedEntityType = entityType ?? getEntityTypeFromIdentifier(identifier!)
  const { data, isLoading, isError } = useTrackProvenanceQuery(identifier!)
  const { data: entityData } = useEntityScopeQuery(identifier!, resolvedEntityType)

  useHomeDisplayScope(homeContext, entityData?.scope, entityData?.featured)

  if (isLoading) {
    return <HomeLoader />
  }

  return isError ? (
    <NotFoundEntity entityType={resolvedEntityType} />
  ) : (
    <>
      <BackLink spaceId={spaceId} entityType={resolvedEntityType} identifier={identifier!} />
      <ResourceHeader>
        <HeaderLeft>
          <Title data-testid={`${resolvedEntityType}-title`}>
            <TrackIcon width={24} height={20} />
            Track
            <EntityIcon entityType={resolvedEntityType} />
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
