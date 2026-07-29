import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { CopyText } from '@/components/CopyText/CopyText'
import { DatabaseIcon } from '@/components/icons/DatabaseIcon'
import { ActionsMenu } from '@/components/Menu'
import { toastInfo } from '@/components/NotificationCenter/ToastHelper'
import { StyledPropertyItem, StyledPropertyKey, StyledTagItem, StyledTags } from '@/components/Tags'
import { useLastWSNotification } from '@/hooks/useLastWSNotification'
import { DATABASE_RESOURCE_LABELS } from '@/types/user'
import { getSpaceIdFromScope } from '@/utils'
import { getBackPathNext } from '@/utils/getBackPath'
import { ActionsMenuContent } from '../home/ActionMenuContent'
import { ActionModalsRenderer } from '../home/ActionModalsRenderer'
import { defaultHomeContext, type HomeScopeContextValue } from '../home/HomeScopeContext'
import { StyledBackLink, StyledRight } from '../home/home.styles'
import {
  Description,
  HeaderLeft,
  HomeLoader,
  MetadataItem,
  MetadataKey,
  MetadataRow,
  MetadataSection,
  MetadataVal,
  MetadataValBreakAll,
  NotFound,
  ResourceHeader,
  Title,
  Topbox,
} from '../home/show.styles'
import { type HomeScope, NOTIFICATION_ACTION } from '../home/types'
import { UserDetailsDrawer } from '../users/UserDetailsDrawer'
import { DBStatus } from './DbStatus'
import { fetchDatabaseRequest } from './databases.api'
import type { IDatabase } from './databases.types'
import { useDatabaseSelectActions } from './useDatabaseSelectActions'

const DatabaseDetails = ({ db, homeScope }: { db: IDatabase; homeScope?: HomeScope }) => {
  const [isUserOpen, setIsUserOpen] = useState<boolean>(false)
  const spaceId = getSpaceIdFromScope(db.scope)
  return (
    <>
      <MetadataSection>
        <MetadataRow>
          <MetadataItem>
            <MetadataKey>Location</MetadataKey>
            <MetadataVal data-testid="db-location">
              <Link
                target="_blank"
                to={spaceId ? `/spaces/${spaceId}/databases` : `/home/databases?scope=${homeScope?.toLowerCase()}`}
              >
                {homeScope === 'featured' ? 'Featured' : db.location}
              </Link>
            </MetadataVal>
          </MetadataItem>
          <MetadataItem>
            <MetadataKey>ID</MetadataKey>
            <MetadataVal data-testid="db-id">
              <CopyText
                className="inline-flex items-center gap-2 cursor-pointer text-[color:var(--c-link)]"
                value={db.uid}
                onCopy={() => toastInfo('Database ID copied to clipboard')}
              >
                <span>{db.uid}</span>
              </CopyText>
            </MetadataVal>
          </MetadataItem>
          <MetadataItem>
            <MetadataKey>Added By</MetadataKey>
            <MetadataVal data-testid="db-added-by">
              {' '}
              <button
                type="button"
                className={'inline-flex items-center gap-2 cursor-pointer text-[color:var(--c-link)]'}
                onClick={() => setIsUserOpen(true)}
              >
                {db.addedBy}
              </button>
            </MetadataVal>
          </MetadataItem>
          <MetadataItem>
            <MetadataKey>Created On</MetadataKey>
            <MetadataVal data-testid="db-created-on">
              {format(new Date(db.createdAtDateTime), 'yyyy-MM-dd HH:mm:ss')}
            </MetadataVal>
          </MetadataItem>
        </MetadataRow>
        <MetadataRow>
          <MetadataItem>
            <MetadataKey>Status</MetadataKey>
            <MetadataVal data-testid="db-status">
              <DBStatus status={db.status} />
            </MetadataVal>
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
            <MetadataVal data-testid="db-instance">
              {DATABASE_RESOURCE_LABELS[db.dxInstanceClass] ?? db.dxInstanceClass}
            </MetadataVal>
          </MetadataItem>
          <MetadataItem>
            <MetadataKey>Synchronization Status</MetadataKey>
            <MetadataVal data-testid="db-sync-status">
              <DBStatus status={db.syncStatus} />
            </MetadataVal>
          </MetadataItem>
        </MetadataRow>
        <MetadataRow>
          <MetadataItem>
            <MetadataKey>Status Updated</MetadataKey>
            <MetadataVal data-testid="db-status-updated">
              {format(new Date(db.statusUpdatedDateTime), 'yyyy-MM-dd HH:mm:ss')}
            </MetadataVal>
          </MetadataItem>
          <MetadataItem>
            <MetadataKey>Host Endpoint</MetadataKey>
            <MetadataValBreakAll data-testid="db-host">{db.host}</MetadataValBreakAll>
          </MetadataItem>
        </MetadataRow>
      </MetadataSection>

      <UserDetailsDrawer userId={db.addedByUserId} open={isUserOpen} onClose={() => setIsUserOpen(false)} />
    </>
  )
}

const DetailActionsDropdown = ({ db }: { db: IDatabase; refetch?: () => void }) => {
  const { actions, modals } = useDatabaseSelectActions({
    selectedItems: [db],
    resourceKeys: ['dbclusters', db.uid],
  })

  return (
    <>
      <ActionsMenu data-testid="db-detail-actions-button">
        <ActionsMenuContent actions={actions} />
      </ActionsMenu>

      <ActionModalsRenderer modals={modals} />
    </>
  )
}

export const DatabaseShow = ({
  databaseId,
  spaceId,
  homeContext = defaultHomeContext,
}: {
  databaseId: string
  spaceId?: number
  homeContext?: HomeScopeContextValue
}) => {
  const { homeScope, setDisplayScope, isHome } = homeContext

  const location = useLocation()
  const { data, isLoading } = useQuery({
    queryKey: ['dbclusters', databaseId],
    queryFn: () =>
      fetchDatabaseRequest(databaseId).then(dbCluster => {
        if (isHome) {
          setDisplayScope(dbCluster.scope)
        }
        return dbCluster
      }),
  })

  const queryCache = useQueryClient()

  const lastJsonMessage = useLastWSNotification([NOTIFICATION_ACTION.DB_CLUSTER_UPDATED])

  useEffect(() => {
    if (lastJsonMessage == null) {
      return
    }
    queryCache.invalidateQueries({
      queryKey: ['dbclusters'],
    })
  }, [lastJsonMessage])

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
              <DatabaseIcon height={20} />
              &nbsp;<span data-testid="db-name">{data.name}</span>
            </Title>
            <Description data-testid="db-description">{data.description}</Description>
          </HeaderLeft>
          <div>
            <StyledRight>{<DetailActionsDropdown db={data} />}</StyledRight>
          </div>
        </ResourceHeader>

        <DatabaseDetails db={data} homeScope={homeScope} />

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
        {data.status === 'stopped' && (
          <MetadataSection>
            <MetadataRow>
              <MetadataItem>
                <MetadataKey>Info</MetadataKey>
                <Description>
                  This database cluster is currently stopped. Seven days after it was stopped, the database cluster will
                  automatically re-activate and begin incurring charges. If you do not wish to keep this database
                  cluster, use the Terminate action to permanently stop it and delete its contents.
                </Description>
              </MetadataItem>
            </MetadataRow>
          </MetadataSection>
        )}
        {data.failureReason && (
          <MetadataSection>
            <MetadataRow>
              <MetadataItem>
                <MetadataKey>Database failure</MetadataKey>
                <Description>{data.failureReason}</Description>
              </MetadataItem>
            </MetadataRow>
          </MetadataSection>
        )}
      </Topbox>
    </>
  )
}
