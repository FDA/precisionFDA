import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useLocation, useParams } from 'react-router-dom'
import { DropdownNext } from '../../components/Dropdown/DropdownNext'
import { Loader } from '../../components/Loader'
import { DatabaseIcon } from '../../components/icons/DatabaseIcon'
import { SyncIcon } from '../../components/icons/SyncIcon'
import { Refresh } from '../../components/Page/styles'
import { StyledTagItem, StyledTags, StyledPropertyItem, StyledPropertyKey } from '../../components/Tags'
import { RESOURCE_LABELS } from '../../types/user'
import { ActionsDropdownContent } from '../home/ActionDropdownContent'
import { ActionModalsRenderer } from '../home/ActionModalsRenderer'
import { StyledBackLink, StyledRight } from '../home/home.styles'
import {
  ActionsButton,
  Description,
  ResourceHeader,
  HeaderLeft,
  HomeLoader,
  MetadataItem,
  MetadataKey,
  MetadataRow,
  MetadataSection,
  MetadataVal,
  NotFound,
  Title,
  Topbox,
  MetadataValBreakAll,
} from '../home/show.styles'
import { fetchDatabaseRequest } from './databases.api'
import { IDatabase } from './databases.types'
import { useDatabaseSelectActions } from './useDatabaseSelectActions'
import { EmitScope, HomeScope } from '../home/types'
import { Button } from '../../components/Button'
import { DBStatus } from './DbStatus'
import { getBackPathNext } from '../../utils/getBackPath'
import { getSpaceIdFromScope } from '../../utils'

const renderOptions = (db: IDatabase, homeScope?: HomeScope) => {
  const spaceId = getSpaceIdFromScope(db.scope)
  return (
  <MetadataSection>
    <MetadataRow>
      <MetadataItem>
        <MetadataKey>Location</MetadataKey>
        <MetadataVal data-testid="db-location">
          <Link target="_blank" to={ spaceId ? `/spaces/${spaceId}/databases` : `/home/databases?scope=${homeScope?.toLowerCase()}`}>
            {homeScope === 'featured' ? 'Featured' : db.location}
          </Link>
        </MetadataVal>
      </MetadataItem>
      <MetadataItem>
        <MetadataKey>ID</MetadataKey>
        <MetadataVal data-testid="db-id">{db.uid}</MetadataVal>
      </MetadataItem>
      <MetadataItem>
        <MetadataKey>Added By</MetadataKey>
        <MetadataVal data-testid="db-added-by">
          {' '}
          <Link target="_blank" to={`/users/${db.addedBy}`}>
            {db.addedByFullname}
          </Link>
        </MetadataVal>
      </MetadataItem>
      <MetadataItem>
        <MetadataKey>Created On</MetadataKey>
        <MetadataVal data-testid="db-created-on">{db.createdAtDateTime}</MetadataVal>
      </MetadataItem>
    </MetadataRow>
    <MetadataRow>
      <MetadataItem>
        <MetadataKey>Status</MetadataKey>
        <MetadataVal data-testid="db-status"><DBStatus status={db.status} /></MetadataVal>
      </MetadataItem>
      <MetadataItem>
        <MetadataKey>DB Port</MetadataKey>
        <MetadataVal data-testid="db-port">{db.port}</MetadataVal>
      </MetadataItem>
      <MetadataItem>
        <MetadataKey>Engine</MetadataKey>
        <MetadataVal data-testid="db-engine">{db.engine}</MetadataVal>
      </MetadataItem>
      <MetadataItem>
        <MetadataKey>Version</MetadataKey>
        <MetadataVal data-testid="db-version">{db.engineVersion}</MetadataVal>
      </MetadataItem>
      <MetadataItem>
        <MetadataKey>Instance</MetadataKey>
        <MetadataVal data-testid="db-instance">{RESOURCE_LABELS[db.dxInstanceClass] ?? db.dxInstanceClass}</MetadataVal>
      </MetadataItem>
    </MetadataRow>
    <MetadataRow>
      <MetadataItem>
        <MetadataKey>Status Updated</MetadataKey>
        <MetadataVal data-testid="db-status-updated">{db.statusUpdatedDateTime}</MetadataVal>
      </MetadataItem>
      <MetadataItem>
        <MetadataKey>Host Endpoint</MetadataKey>
        <MetadataValBreakAll data-testid="db-host">{db.host}</MetadataValBreakAll>
      </MetadataItem>
    </MetadataRow>
  </MetadataSection>
)}

const DetailActionsDropdown = ({ db }: { db: IDatabase; refetch?: () => void }) => {
  const { actions, modals } = useDatabaseSelectActions({
    selectedItems: [db],
    resourceKeys: ['dbclusters', db.uid],
  })

  return (
    <>
      <DropdownNext
        trigger="click"
        content={() => <ActionsDropdownContent actions={actions} />}
      >
        {dropdownProps => <ActionsButton {...dropdownProps} active={dropdownProps.$isActive} />}
      </DropdownNext>

      <ActionModalsRenderer modals={modals} />
    </>
  )
}

export const DatabaseShow = ({ emitScope, homeScope, spaceId }: { homeScope?: HomeScope, emitScope?: EmitScope, spaceId?: number }) => {
  const { uid } = useParams<{ uid: string }>()
  const location = useLocation()
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['dbclusters', uid],
    queryFn: () =>
      fetchDatabaseRequest(uid!).then(dbCluster => {
        if (emitScope) emitScope(dbCluster.scope, dbCluster.featured)
        return dbCluster
      }),
  })

  if (isLoading) return <HomeLoader />

  const backPath = getBackPathNext({
    location, 
    resourceLocation: 'databases',
    homeScope,
    spaceId,
  })

  if (!data)
    return (
      <NotFound>
        <h1>Database not found</h1>
        <div>Sorry, this database does not exist or is not accessible by you.</div>
      </NotFound>
    )

  return (
    <>
      <StyledBackLink linkTo={backPath} data-testid="db-back-link">
        Back to Databases
      </StyledBackLink>
      <Topbox>
        <ResourceHeader>
          <HeaderLeft>
            <Title>
              <DatabaseIcon height={20}/>
              &nbsp;<span data-testid="db-name">{data.name}</span>
              {['creating', 'starting', 'stopping', 'terminating'].includes(data.status) && <Loader/>}
            </Title>
            <Description data-testid="db-description">{data.description}</Description>
          </HeaderLeft>
          <div>
            <StyledRight>
              {data.status !== 'terminated' && (
                <Button data-testid="db-refresh-status" onClick={() => refetch()} disabled={isFetching}>
                  <Refresh $spin={isFetching}>
                    <SyncIcon />
                  </Refresh>
                  Refresh
                </Button>
              )}
              {<DetailActionsDropdown db={data} />}
            </StyledRight>
          </div>
        </ResourceHeader>

        {renderOptions(data, homeScope)}

        {data.tags.length > 0 && (
          <MetadataSection>
            <MetadataRow>
              <MetadataItem>
                <MetadataKey>Tags</MetadataKey>
                <StyledTags data-testid="tags-container">
                  {data.tags.map(tag => (
                    <StyledTagItem data-testid="db-tag-item" key={tag}>
                      {tag}
                    </StyledTagItem>
                  ))}
                </StyledTags>
              </MetadataItem>
            </MetadataRow>
          </MetadataSection>
        )}
        {Object.entries(data.properties).length > 0 && (
          <MetadataSection>
            <MetadataRow>
              <MetadataItem>
                <MetadataKey>Properties</MetadataKey>
                <StyledTags data-testid="properties-container">
                  {Object.entries(data.properties).map(([key, value]) => (
                    <StyledPropertyItem key={key}>
                      <StyledPropertyKey data-testid="db-property-key">{key}</StyledPropertyKey>
                      <span data-testid={`db-property-value-${key}`}>{value}</span>
                    </StyledPropertyItem>
                  ))}
                </StyledTags>
              </MetadataItem>
            </MetadataRow>
          </MetadataSection>
        )}
      </Topbox>
    </>
  )
}
