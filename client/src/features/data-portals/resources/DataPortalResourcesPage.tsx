import {
  UseMutationOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import axios from 'axios'
import React from 'react'
import { useParams } from 'react-router'
import styled from 'styled-components'
import { Loader } from '../../../components/Loader'
import { BackLink } from '../../../components/Page/PageBackLink'
import { CrossIcon } from '../../../components/icons/PlusIcon'
import { UserLayout } from '../../../layouts/UserLayout'
import { theme } from '../../../styles/theme'
import { CreateResource } from '../../resources/CreateResource'
import { StyledPageCenter } from '../../spaces/form/styles'
import { NoContent } from '../../../components/Public/styles'
import { AlertText } from '../details/DataPortalNotFound'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { useAuthUser } from '../../auth/useAuthUser'

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

interface DataPortalResource {
  dataPortals: number
  id: number
  meta: null | any
  url: null | any
  user: number
  userFile: number
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

  const handleSuccess = () => {
    queryClient.invalidateQueries(['resources-list-portal'])
  }

  if (status === 'loading') return <Loader />

  return (
    <UserLayout>
      <StyledPageCenter>
        <StyledPageContent>
          <TopRow>
            <BackLink linkTo={`/data-portals/${portalId}`}>
              Back to Data Portal
            </BackLink>

            {user?.isAdmin && <CreateResource pid={portalId} onSuccess={handleSuccess} />}
          </TopRow>
          {user?.isAdmin ? (
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
                      <ImageContainer>
                        <img src={re.url} alt="resource item" />
                        <Remove onClick={() => handleRemove(re.id)}>
                          <CrossIcon height={12} />
                        </Remove>
                      </ImageContainer>
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
