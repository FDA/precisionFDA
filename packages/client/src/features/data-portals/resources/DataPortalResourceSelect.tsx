import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import styled from 'styled-components'
import { Loader } from '../../../components/Loader'
import { NoContent } from '../../../components/Public/styles'
import { theme } from '../../../styles/theme'
import ResourcesSelect from './ResourcesSelect'
import { ModalScroll } from '../../modal/styles'
import { Button, TransparentButton } from '../../../components/Button'
import { listDataPortalResourcesRequest } from './resources.api'

const StyledRefresh = styled.span`
  color: ${theme.colors.primaryBlue};
  text-decoration: none;
  &:hover {
    color: #4297df;
  }
`

const useListDataPortalResourcesQuery = (id?: string) =>
  useQuery({
    queryKey: ['resources-list-portal'],
    queryFn: () => listDataPortalResourcesRequest(id),
    enabled: !!id,
  })

const DataPortalResourceSelect = ({
  onSelect,
}: {
  onSelect: (url: string) => void
}) => {
  const { portalId } = useParams<{
    portalId: string
  }>()
  const { data, isLoading, refetch } = useListDataPortalResourcesQuery(portalId)

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
      {isLoading ? <Loader /> : <ResourcesSelect list={data || []} onChange={onSelect} />}
    </ModalScroll>
  )
}

export default DataPortalResourceSelect
