import {
  UseMutationOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import axios from 'axios'
import React from 'react'
import { useParams } from 'react-router'
import { toast } from 'react-toastify'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'
import { Loader } from '../../../components/Loader'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { BackLink } from '../../../components/Page/PageBackLink'
import { NoContent } from '../../../components/Public/styles'
import { BookIcon } from '../../../components/icons/BookIcon'
import { CrossIcon } from '../../../components/icons/PlusIcon'
import { UserLayout } from '../../../layouts/UserLayout'
import { theme } from '../../../styles/theme'
import { useAuthUser } from '../../auth/useAuthUser'
import { CreateResource } from '../../resources/CreateResource'
import { ResourceThumb } from '../../resources/ResourceThumb'
import { StyledPageCenter } from '../../spaces/form/styles'
import { AlertText } from '../details/DataPortalNotFound'
import { useDataPortalByIdQuery } from '../queries'
import { canEditResources } from '../utils'
import { getFileNameFromUrl } from '../../resources/util'

const StyledPageContent = styled.div`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`
const TopRow = styled.div`
  display: flex;
  gap: 16px;
  justify-content: space-between;
`
const StyledResourceItem = styled.div`
  display: flex;
  justify-content: center;
  max-width: 100px;

  img {
    width: 100%;
  }
`
const ResourceList = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-gap: 12px;
  max-width: 500px;
`
const ImageContainer = styled.div`
  position: relative;
`
const Remove = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  color: white;
  background: ${theme.colors.darkRed};
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 10px;
`
const Copy = styled.div`
  position: absolute;
  top: -10px;
  right: 15px;
  color: white;
  background: ${theme.colors.darkGreen};
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 10px;
`

interface DataPortalResource {
  dataPortals: number
  id: number
  meta: null | any
  url: null | string
  user: number
  user_file: number
}

interface RemovePayload {
  portalId: string
  resourceId: number
}

// TODO: Extract API calls to api.ts
const listDataPortalResourcesRequest = (id: string) =>
  axios
    .get(`/api/data_portals/${id}/resources`)
    .then(r => r.data.resources as DataPortalResource[])

const removeResourceByIdRequest = ({ portalId, resourceId }: RemovePayload) =>
  axios
    .delete(`/api/data_portals/${portalId}/resources/${resourceId}`)
    .then(r => r.data)

const useListDataPortalResourcesQuery = (id: string) =>
  useQuery({
    queryKey: ['resources-list-portal'],
    queryFn: () => listDataPortalResourcesRequest(id),
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
  const { portalId } = useParams<{
    portalId: string
  }>()
  const { data: portal, status: portalStatus } =
    useDataPortalByIdQuery(portalId)
  const { data, status } = useListDataPortalResourcesQuery(portalId)

  const mutation = useResourceRemoveMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(['resources-list-portal'])
    },
  })

  const handleRemove = async (id: number) => {
    if (
      confirm(
        'Are you sure you want to delete this resource item? Pages where this file is referenced will break.',
      ) === true
    ) {
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

  const handleSuccess = () => {
    queryClient.invalidateQueries(['resources-list-portal'])
  }

  if (status === 'loading' || portalStatus === 'loading') return <Loader />
  const canEdit = canEditResources(user?.dxuser, portal?.members)
  return (
    <UserLayout>
      <StyledPageCenter>
        <StyledPageContent>
          <TopRow>
            <BackLink linkTo={`/data-portals/${portalId}`}>
              Back to Data Portal
            </BackLink>

            {canEdit && (
              <CreateResource pid={portalId} onSuccess={handleSuccess} />
            )}
          </TopRow>
          {portal ? (
            <>
              {data?.length === 0 && (
                <NoContent>
                  <AlertText>This Data Portal has no resources</AlertText>
                </NoContent>
              )}
              <ResourceList>
                {data?.map(re => {
                  return (
                    <StyledResourceItem key={re.id}>
                      <ImageContainer data-tip data-for={`tip-${re.id}`}>
                        <ResourceThumb url={re.url} />
                        {canEdit && (
                          <Remove onClick={() => handleRemove(re.id)}>
                            <CrossIcon height={12} />
                          </Remove>
                        )}
                        {re.url && (
                          <Copy onClick={() => handleCopy(re.url)}>
                            <BookIcon height={12} />
                          </Copy>
                        )}
                      </ImageContainer>
                      {re.url && (
                        <ReactTooltip
                          id={`tip-${re.id}`}
                          place="top"
                          effect="solid"
                        >
                          {getFileNameFromUrl(re.url)}
                        </ReactTooltip>
                      )}
                    </StyledResourceItem>
                  )
                })}
              </ResourceList>
            </>
          ) : (
            <NotAllowedPage />
          )}
        </StyledPageContent>
      </StyledPageCenter>
    </UserLayout>
  )
}

export default DataPortalResourcesPage
