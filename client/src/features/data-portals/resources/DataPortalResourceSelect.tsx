import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import styled from 'styled-components'
import { Loader } from '../../../components/Loader'
import { NoContent } from '../../../components/Public/styles'
import { theme } from '../../../styles/theme'
import ResourcesSelect from './ResourcesSelect'
import { ModalScroll } from '../../modal/styles'
import { Button, TransparentButton } from '../../../components/Button'

const StyledRefresh = styled.span`
  color: ${theme.colors.primaryBlue};
  text-decoration: none;
  &:hover {
    color: #4297df;
  }
`

interface DataPortalResource {
  dataPortals: number
  id: number
  meta: null | any
  url: null | any
  user: number
  userFile: number
}

// TODO: Extract API calls to api.ts
const listDataPortalResourcesRequest = (id: string) =>
  axios
    .get(`/api/data_portals/${id}/resources`)
    .then(r => r.data.resources as DataPortalResource[])

const useListDataPortalResourcesQuery = (id: string) =>
  useQuery({
    queryKey: ['resources-list-portal'],
    queryFn: () => listDataPortalResourcesRequest(id),
  })

const DataPortalResourceSelect = ({
  onSelect,
}: {
  onSelect: (url: string) => void
}) => {
  const { portalId } = useParams<{
    portalId: string
  }>()
  const { data, status, refetch } = useListDataPortalResourcesQuery(portalId)

  return (
    <ModalScroll data-testid="lexi-resource-select">
      {data?.length === 0 && (
        <NoContent>
          <p>This Data Portal has no resources</p>
          <TransparentButton onClick={() => refetch()}>
            <StyledRefresh>Refresh</StyledRefresh>
          </TransparentButton>
          <Button
            type="button"
            as={Link}
            to={`/data-portals/${portalId}/resources`}
            target="__blank"
          >
            Upload Resources
          </Button>
        </NoContent>
      )}
      {status === 'loading' ? <Loader /> : <ResourcesSelect list={data || []} onChange={onSelect} />}
    </ModalScroll>
  )
}

export default DataPortalResourceSelect
