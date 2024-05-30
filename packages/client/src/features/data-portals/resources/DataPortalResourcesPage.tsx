import React, { useEffect, useState } from 'react'
import {
  UseMutationOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import useWebSocket from 'react-use-websocket'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { BackLink } from '../../../components/Page/PageBackLink'
import { NoContent } from '../../../components/Public/styles'
import { UserLayout } from '../../../layouts/UserLayout'
import {
  DEFAULT_RECONNECT_ATTEMPTS,
  DEFAULT_RECONNECT_INTERVAL,
  SHOULD_RECONNECT,
  getNodeWsUrl,
} from '../../../utils/config'
import { useAuthUser } from '../../auth/useAuthUser'
import { Notification, NOTIFICATION_ACTION } from '../../home/types'
import { CreateResource } from '../../resources/CreateResource'
import ResourceItem from '../../resources/ResourceItem'
import { StyledPageCenter } from '../../spaces/form/styles'
import { AlertText } from '../details/DataPortalNotFound'
import { useDataPortalByIdQuery } from '../queries'
import { canEditResources } from '../utils'
import { listDataPortalResourcesRequest, removeResourceByIdRequest } from './resources.api'
import { RemovePayload } from './resources.types'

const StyledPageContent = styled.div`
    margin-top: 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 400px;
`
const TopRow = styled.div`
  display: flex;
  gap: 16px;
  justify-content: space-between;
`

const SearchBarWrapper = styled.div`
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
`

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px; // Space between input and button

  & > input {
      width: 330px;
  }
`

const ResourceList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
  width: 100%;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr; // Two columns for larger screens
  }
`

const useListDataPortalResourcesQuery = (id: string) =>
  useQuery({
    queryKey: ['resources-list-portal'],
    queryFn: () => listDataPortalResourcesRequest(id),
    select: (d) => d,
  })

const useResourceRemoveMutation = (
  options?: Omit<
    UseMutationOptions<any, unknown, RemovePayload, unknown>,
    'mutationKey' | 'mutationFn'
  >,
) =>
  useMutation({
    mutationKey: ['remove-resource-portal'],
    mutationFn: (payload: RemovePayload) => removeResourceByIdRequest(payload),
    ...options,
  })

const DataPortalResourcesPage = () => {
  const user = useAuthUser()
  const queryClient = useQueryClient()
  const { portalId } = useParams<{ portalId: string }>()

  if (!portalId || !user) return <NotAllowedPage/>

  const { data: portal, isLoading: portalIsLoading } = useDataPortalByIdQuery(portalId)
  const { data, isLoading } = useListDataPortalResourcesQuery(portalId)
  const [isFinishingUpload, setIsFinishingUpload] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const mutation = useResourceRemoveMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['resources-list-portal'],
      })
    },
  })

  const { lastJsonMessage: notification } = useWebSocket<Notification>(getNodeWsUrl(), {
    share: true,
    reconnectInterval: DEFAULT_RECONNECT_INTERVAL,
    reconnectAttempts: DEFAULT_RECONNECT_ATTEMPTS,
    shouldReconnect: () => SHOULD_RECONNECT,
  })

  useEffect(() => {
    if (notification == null) {
      return
    }
    if (NOTIFICATION_ACTION.FILE_CLOSED === notification.action) {
      queryClient.invalidateQueries({ queryKey: ['resources-list-portal'] })
      setIsFinishingUpload(false)
    }
  }, [notification])

  const handleRemove = async (id: number) => {
    if (confirm('Are you sure you want to delete this resource item? Pages where this file is referenced will break.')) {
      return mutation.mutateAsync({ portalId, resourceId: id })
    }
    return undefined
  }

  const handleCopy = async (link: string | null) => {
    if (link) {
      await navigator.clipboard.writeText(link)
      toast.success('Copied resource link to your clipboard')
    }
  }

  const filteredData = data?.filter((resource) =>
    resource.name.toLowerCase().includes(searchQuery.toLowerCase())) ?? []

  if (isLoading || portalIsLoading) return <Loader/>
  if (!portal) return <NotAllowedPage/>

  const canEdit = canEditResources(user.dxuser, portal.members)

  return (
    <UserLayout>
      <StyledPageCenter>
        <StyledPageContent>
          <TopRow>
            <BackLink linkTo={`/data-portals/${portal.urlSlug}`}>
              Back to Data Portal
            </BackLink>

            {canEdit && (
              <CreateResource pid={portalId} onSuccess={() => {
                setIsFinishingUpload(true)
              }}/>
            )}
          </TopRow>

          <SearchBarWrapper>
            <SearchBar>
              <InputText
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="button" variant="primary" onClick={() => setSearchQuery('')}>
                Clear
              </Button>
            </SearchBar>
          </SearchBarWrapper>
          {filteredData.length === 0 ? (
            <NoContent>
              <AlertText>No resources found</AlertText>
            </NoContent>
          ) : (
            <ResourceList>
              {filteredData.map(re => (
                <ResourceItem
                  key={re.id}
                  resource={re}
                  canEdit={canEdit}
                  onRemove={handleRemove}
                  onCopy={handleCopy}
                />
              ))}
              {isFinishingUpload && <Loader/>}
            </ResourceList>
          )}
        </StyledPageContent>
      </StyledPageCenter>
    </UserLayout>
  )
}

export default DataPortalResourcesPage
