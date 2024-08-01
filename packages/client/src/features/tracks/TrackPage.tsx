import React from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { theme } from '../../styles/theme'
import { ResourceHeader, HomeLoader, Title } from '../home/show.styles'
import {
  EntityIcon,
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

const PageHeader = styled(ResourceHeader)`
  padding: 20px 16px;
  background-color: #f4f8fd;
  border-bottom: 1px solid #e3edfa;
`

const PageHeaderTitle = styled(Title)`
  font-size: 30px;
  font-weight: 400;
  color: ${theme.colors.darkGreyOnGrey};
`

const Link = styled.a`
  display: flex;
  align-items: center;
  font-size: 85%;
`

const BlueTrackIcon = styled(TrackIcon)`
  color: ${theme.colors.darkGreyOnGrey};
`

export const TrackPage = () => {
  const identifier = useParams<TrackProvenancePageParams>()?.identifier
  const entityType = getEntityTypeFromIdentifier(identifier!)
  const { data, isLoading, isError } = useTrackProvenanceQuery(identifier!)
  if (isLoading) {
    return <HomeLoader />
  }

  return isError ? (
    <NotFoundEntity entityType={entityType} />
  ) : (
    <>
      <PageHeader>
        <PageHeaderTitle data-testid={`${entityType}-title`}>
          <BlueTrackIcon width={36} height={30} />
          <span>Track</span>
          <Link href={`/${convertEntityLink(entityType, identifier!)}`}>
            <EntityIcon entityType={entityType} />
            &nbsp;{data?.name}
          </Link>
        </PageHeaderTitle>
      </PageHeader>
      <TrackWrapper>
        <TrackHelp />
        <TrackProvenanceContent svg={data?.svg ?? ''} />
      </TrackWrapper>
    </>
  )
}
