import { UseMutationOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import useWebSocket from 'react-use-websocket'
import { Button } from '../../components/Button'
import { InputText } from '../../components/InputText'
import { Loader } from '../../components/Loader'
import { NotAllowedPage } from '../../components/NotAllowed'
import { NoContent } from '../../components/Public/styles'
import { CopyIcon } from '../../components/icons/CopyIcon'
import { FileIcon } from '../../components/icons/FileIcon'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, SHOULD_RECONNECT, getNodeWsUrl } from '../../utils/config'
import { useAuthUser } from '../auth/useAuthUser'
import { AlertText } from '../data-portals/details/DataPortalNotFound'
import { useDataPortalByIdQuery } from '../data-portals/queries'
import { RemovePayload, Resource } from '../data-portals/resources/resources.types'
import { canEditResources } from '../data-portals/utils'
import { NOTIFICATION_ACTION, Notification, WEBSOCKET_MESSSAGE_TYPE, WebSocketMessage } from '../home/types'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ModalLoaderWrapper } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { CreateResource } from './CreateResource'
import ResourceItem from './ResourceItem'
import { listDataPortalResourcesRequest, removeResourceByIdRequest } from './resources.api'
import {
  CopyUrl,
  FileThumb,
  PreviewBottom,
  PreviewMain,
  PreviewMainImg,
  PreviewTop,
  ResourceList,
  ResourcePageRow,
  SearchBar,
  SearchBarWrapper,
  StyledNothingSelected,
  StyledPageContent,
  StyledResourcePreview,
  StyledSide,
  TopCol,
  TopRow,
} from './styles'
import { getExt, isImageFromExt } from './util'

const ResourcePreview = ({ resource, onCopy }: { resource?: Resource; onCopy: (link: string) => void }) => {
  if (!resource) return <StyledResourcePreview />
  const ext = getExt(resource.url)
  const isImg = isImageFromExt(ext)
  return (
    <StyledResourcePreview>
      <PreviewTop>{resource.name}</PreviewTop>
      {isImg ? (
        <PreviewMainImg>
          <img src={resource.url} loading="lazy" alt="resource item" />
        </PreviewMainImg>
      ) : (
        <PreviewMain>
          <FileThumb>
            <FileIcon height={70} />
            <div className="ext">{ext}</div>
          </FileThumb>
        </PreviewMain>
      )}
      <PreviewBottom>
        <CopyUrl onClick={() => onCopy(resource.url)}>
          <CopyIcon height={16} />
          {resource.url}
        </CopyUrl>
      </PreviewBottom>
    </StyledResourcePreview>
  )
}

const useListDataPortalResourcesQuery = (id: string) =>
  useQuery({
    queryKey: ['resources-list-portal'],
    queryFn: () => listDataPortalResourcesRequest(id),
    select: d => d,
  })

const useResourceRemoveMutation = (
  options?: Omit<UseMutationOptions<any, unknown, RemovePayload, unknown>, 'mutationKey' | 'mutationFn'>,
) =>
  useMutation({
    mutationKey: ['remove-resource-portal'],
    mutationFn: (payload: RemovePayload) => removeResourceByIdRequest(payload),
    ...options,
  })

export const DataPortalResources = ({
  onInsert,
  onlyImg,
}: {
  onlyImg?: boolean
  onInsert?: (i: { altText: string; src: string }) => void
}) => {
  const user = useAuthUser()
  const queryClient = useQueryClient()
  const { portalId } = useParams<{ portalId: string }>()
  const { data: portal, isLoading: portalIsLoading } = useDataPortalByIdQuery(portalId)
  const { data, isLoading } = useListDataPortalResourcesQuery(portalId)
  const [isFinishingUpload, setIsFinishingUpload] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selected, setSelected] = useState<null | number>(null)

  const mutation = useResourceRemoveMutation({
    onSuccess: () => {
      setSelected(null)
      queryClient.invalidateQueries({
        queryKey: ['resources-list-portal'],
      })
    },
    onMutate: async r => {
      await queryClient.cancelQueries({ queryKey: ['resources-list-portal'] })
      const previousTodos = queryClient.getQueryData(['resources-list-portal'])

      queryClient.setQueryData<Resource[]>(['resources-list-portal'], old =>
        old?.map(item => (item.id === r.resourceId ? { ...item, isDeleting: true } : item)),
      )
      return { previousTodos }
    },
  })

  const { lastJsonMessage } = useWebSocket<WebSocketMessage>(getNodeWsUrl(), {
    share: true,
    reconnectInterval: DEFAULT_RECONNECT_INTERVAL,
    reconnectAttempts: DEFAULT_RECONNECT_ATTEMPTS,
    shouldReconnect: () => SHOULD_RECONNECT,
    filter: message => {
      try {
        const messageData = JSON.parse(message.data)
        const notification = messageData.data as Notification
        return (
          messageData.type === WEBSOCKET_MESSSAGE_TYPE.NOTIFICATION && NOTIFICATION_ACTION.FILE_CLOSED === notification.action
        )
      } catch (e) {
        return false
      }
    },
  })

  useEffect(() => {
    if (lastJsonMessage == null) {
      return
    }
    queryClient.invalidateQueries({ queryKey: ['resources-list-portal'] })
    setIsFinishingUpload(false)
  }, [lastJsonMessage])

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

  let filteredData =
    data
      ?.filter(i => {
        if (onlyImg) {
          return isImageFromExt(getExt(i.url))
        }
        return true
      })
      .filter(resource => resource.name.toLowerCase().includes(searchQuery.toLowerCase())) ?? []

  const getSelected = () => data?.find(i => i.id === selected)
  const handleInsert = () => {
    const i = getSelected()
    if (onInsert && i) {
      onInsert({ altText: i.name, src: i.url })
    }
  }

  if (isLoading || portalIsLoading)
    return (
      <ModalLoaderWrapper>
        <Loader />
      </ModalLoaderWrapper>
    )
  if (!portal || !user) return <NotAllowedPage />

  const canEdit = canEditResources(user.dxuser, portal.members)
  const isDeletingSelected = filteredData.find(i => i.id === selected)?.isDeleting

  return (
    <ResourcePageRow data-testid="lexi-resource-select">
      <StyledPageContent>
        <TopCol>
          <TopRow>
            <SearchBarWrapper>
              <SearchBar>
                <InputText placeholder="Search resources..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <Button type="button" onClick={() => setSearchQuery('')}>
                  Clear
                </Button>
              </SearchBar>
            </SearchBarWrapper>

            {canEdit && (
              <CreateResource
                pid={portalId}
                onSuccess={() => {
                  setIsFinishingUpload(true)
                }}
              />
            )}
          </TopRow>
        </TopCol>

        {filteredData.length === 0 ? (
          <NoContent>
            <AlertText>No resources found</AlertText>
          </NoContent>
        ) : (
          <ResourceList>
            {filteredData.map(re => (
              <ResourceItem
                key={re.id}
                onClick={id => setSelected(id)}
                resource={re}
                canEdit={canEdit}
                onRemove={handleRemove}
                onCopy={handleCopy}
              />
            ))}
            {isFinishingUpload && <Loader />}
          </ResourceList>
        )}
      </StyledPageContent>
      <StyledSide isDeleting={isDeletingSelected}>
        {selected ? (
          <>
            <ResourcePreview onCopy={handleCopy} resource={getSelected()} />
            <PreviewBottom>
              <Button data-variant="warning" onClick={() => handleRemove(selected)} disabled={isDeletingSelected}>
                Delete
              </Button>
              {onInsert && (
                <Button data-variant="success" onClick={() => handleInsert()}>
                  Insert {onlyImg ? 'Image' : 'File'}
                </Button>
              )}
            </PreviewBottom>
          </>
        ) : (
          <StyledNothingSelected>Select a resource</StyledNothingSelected>
        )}
      </StyledSide>
    </ResourcePageRow>
  )
}

export const useDataPortalResourceModal = () => {
  const { isShown, setShowModal } = useModal()

  const modalComp = (
    <ModalNext
      id="modal-files-add-folder"
      data-testid="modal-files-add-folder"
      isShown={Boolean(isShown)}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop headerText="Resource Manager" hide={() => setShowModal(false)} />
      <DataPortalResources />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
