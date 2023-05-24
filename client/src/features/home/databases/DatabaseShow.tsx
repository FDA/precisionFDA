import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import Dropdown from '../../../components/Dropdown'
import { Loader } from '../../../components/Loader'
import { DatabaseIcon } from '../../../components/icons/DatabaseIcon'
import { SyncIcon } from '../../../components/icons/SyncIcon'
import { Refresh } from '../../../components/Page/styles'
import { StyledTagItem, StyledTags } from '../../../components/Tags'
import { ActionsDropdownContent } from '../ActionDropdownContent'
import { StyledBackLink, StyledRight } from '../home.styles'
import {
  ActionsButton,
  Description,
  Header,
  HeaderLeft,
  HeaderRight,
  HomeLoader,
  MetadataItem,
  MetadataKey,
  MetadataRow,
  MetadataSection,
  MetadataVal,
  NotFound,
  Title,
  Topbox,
} from '../show.styles'
import { fetchDatabaseRequest } from './databases.api'
import { IDatabase } from './databases.types'
import { useDatabaseSelectActions } from './useDatabaseSelectActions'
import { ResourceScope } from '../types'
import { getScopeMapping } from '../getScopeMapping'

const renderOptions = (db: IDatabase, scope: ResourceScope) => (
  <MetadataSection>
    <MetadataRow>
      <MetadataItem>
        <MetadataKey>Location</MetadataKey>
        <MetadataVal>
          {db.location && (
            <Link target="_blank" to={`/home/databases?scope=${scope?.toLowerCase()}`}>
              {scope === 'featured' ? 'Featured' : db.location}
            </Link>
          )}
        </MetadataVal>
      </MetadataItem>
      <MetadataItem>
        <MetadataKey>ID</MetadataKey>
        <MetadataVal>{db.dxid}</MetadataVal>
      </MetadataItem>
      <MetadataItem>
        <MetadataKey>Added By</MetadataKey>
        <MetadataVal>
          {' '}
          <Link target="_blank" to={db.links.user!}>
            {db.added_by_fullname}
          </Link>
        </MetadataVal>
      </MetadataItem>
      <MetadataItem>
        <MetadataKey>Created On</MetadataKey>
        <MetadataVal>{db.created_at_date_time}</MetadataVal>
      </MetadataItem>
    </MetadataRow>
    <MetadataRow>
      <MetadataItem>
        <MetadataKey>DB Status</MetadataKey>
        <MetadataVal>{db.status}</MetadataVal>
      </MetadataItem>
      <MetadataItem>
        <MetadataKey>DB Port</MetadataKey>
        <MetadataVal>{db.port}</MetadataVal>
      </MetadataItem>
      <MetadataItem>
        <MetadataKey>Engine</MetadataKey>
        <MetadataVal>{db.engine}</MetadataVal>
      </MetadataItem>
      <MetadataItem>
        <MetadataKey>Version</MetadataKey>
        <MetadataVal>{db.engine_version}</MetadataVal>
      </MetadataItem>
      <MetadataItem>
        <MetadataKey>Instance</MetadataKey>
        <MetadataVal>{db.dx_instance_class}</MetadataVal>
      </MetadataItem>
    </MetadataRow>
    <MetadataRow>
      <MetadataItem>
        <MetadataKey>Status Updated</MetadataKey>
        <MetadataVal>{db.status_updated_date_time}</MetadataVal>
      </MetadataItem>
      <MetadataItem>
        <MetadataKey>Host Endpoint</MetadataKey>
        <MetadataVal>{db.host}</MetadataVal>
      </MetadataItem>
    </MetadataRow>
  </MetadataSection>
)

const DetailActionsDropdown = ({
  db,
  refetch,
}: {
  db: IDatabase
  refetch: () => void
}) => {
  const actions = useDatabaseSelectActions([db], ['dbclusters', db.dxid])

  return (
    <>
      <Dropdown
        trigger="click"
        content={<ActionsDropdownContent actions={actions} />}
      >
        {dropdownProps => (
          <ActionsButton {...dropdownProps} active={dropdownProps.isActive} />
        )}
      </Dropdown>

      {actions['Copy to space']?.modal}
      {actions['Edit Database Info']?.modal}
      {actions['Edit tags']?.modal}
      {actions['Start']?.modal}
      {actions['Stop']?.modal}
      {actions['Terminate']?.modal}
      {actions['Attach License']?.modal}
      {actions['Detach License']?.modal}
    </>
  )
}

export const DatabaseShow = ({ emitScope }: { emitScope?: (scope: ResourceScope) => void }) => {
  const { dxid } = useParams<{ dxid: string }>()
  const { data, status, isLoading, refetch, isFetching } = useQuery(
    ['dbclusters', dxid],
    () => fetchDatabaseRequest(dxid),
  )

  const db = data?.db_cluster

  if (isLoading) return <HomeLoader />

  if (!db)
    return (
      <NotFound>
        <h1>Database not found</h1>
        <div>
          Sorry, this database does not exist or is not accessible by you.
        </div>
      </NotFound>
    )

  const scope = getScopeMapping(db.scope, db.featured)
  if (emitScope) {
    emitScope(scope)
  }

  return (
    <>
      <StyledBackLink linkTo="/home/databases">
        Back to Databases
      </StyledBackLink>
      <Topbox>
        <Header>
          <HeaderLeft>
            <Title>
              <DatabaseIcon height={20} />
              &nbsp;{db?.name}
              {(db.status === 'starting' ||
                db.status === 'stopping' ||
                db.status === 'terminating') && <Loader />}
            </Title>
            <Description>{db.description}</Description>
          </HeaderLeft>
          <HeaderRight>
            <StyledRight>
              <Refresh spin={isFetching} onClick={() => refetch()}>
                <SyncIcon />
              </Refresh>
              {db && <DetailActionsDropdown db={db} refetch={refetch} />}
            </StyledRight>
          </HeaderRight>
        </Header>

        {renderOptions(db, scope)}
        <MetadataSection>
          {db.tags.length > 0 && (
            <StyledTags>
              {db.tags.map(tag => (
                <StyledTagItem key={tag}>{tag}</StyledTagItem>
                ))}
            </StyledTags>
          )}
        </MetadataSection>
      </Topbox>
    </>
  )
}
