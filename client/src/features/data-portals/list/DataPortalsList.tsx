import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { ButtonSolidBlue } from '../../../components/Button'
import { Loader } from '../../../components/Loader'
import { PageContainerMargin, PageTitle } from '../../../components/Page/styles'
import { PageLoaderWrapper } from '../../../components/Public/styles'
import { usePageMeta } from '../../../hooks/usePageMeta'
import { UserLayout } from '../../../layouts/UserLayout'
import { StyledPageCenter } from '../../spaces/form/styles'
import { dataPortalsListRequest } from '../api'
import { AlertText } from '../details/DataPortalNotFound'
import { DataPortalListItem } from './DataPortalListItem'
import { useAuthUser } from '../../auth/useAuthUser'

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const TopRow = styled.div`
  display: flex;
  padding: 32px 0;
  justify-content: space-between;
`

export const PageMainBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  flex-grow: 1;
  max-width: 700px;
`

const DataPortalsList = () => {
  const user = useAuthUser()
  usePageMeta({ title: 'Data Portals - precisionFDA' })
  const { data, isLoading } = useQuery({
    queryKey: ['data-portals-list'],
    queryFn: () => dataPortalsListRequest(),
  })

  return (
    <UserLayout>
      <PageContainerMargin>
        {isLoading ? (
          <PageLoaderWrapper>
            <Loader />
          </PageLoaderWrapper>
        ) : (
          <StyledPageCenter>
            <PageMainBody>
              <TopRow>
                <PageTitle>Data Portals</PageTitle>
                {user?.isAdmin && (
                  <ButtonSolidBlue
                    as={Link}
                    to="/data-portals/create"
                    data-turbolinks="false"
                    >
                    Create a Data Portal
                  </ButtonSolidBlue>
                )}
              </TopRow>
              {data?.length === 0 && (
                <AlertText>You have no Data Portals</AlertText>
              )}
              {data && (
                <List>
                  {data?.map(portal => (
                    <DataPortalListItem key={portal.id} dataPortal={portal} />
                  ))}
                </List>
              )}
            </PageMainBody>
          </StyledPageCenter>
        )}
      </PageContainerMargin>
    </UserLayout>
  )
}

export default DataPortalsList
