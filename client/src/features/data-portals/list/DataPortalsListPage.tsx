import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
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
import { theme } from '../../../styles/theme'
import { useMainDataPortal } from '../queries'
import { Button } from '../../../components/Button'

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

export const ListSectionTitle = styled.div`
  color: ${theme.colors.textDarkGreyInactive};
  margin-bottom: 8px;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 14px;
`

export const ListSection = styled.div`
  margin-bottom: 32px;
`

const MainDataPortalItem = () => {
  const { data, isLoading } = useMainDataPortal()

  if (isLoading || !data) return <Loader />
  return <DataPortalListItem dataPortal={data} isMain />
}

const DataPortalsListPage = () => {
  const user = useAuthUser()
  usePageMeta({ title: 'Data Portals - precisionFDA' })
  const { data, isLoading } = useQuery({
    queryKey: ['data-portals-list'],
    queryFn: () => dataPortalsListRequest(),
  })

  return (
    <UserLayout>
      <PageContainerMargin>
        <StyledPageCenter>
          <PageMainBody>
            <TopRow>
              <PageTitle>Data Portals</PageTitle>
              {user?.isAdmin && (
                <Button
                  variant="primary"
                  as={Link}
                  to="/data-portals/create"
                  data-turbolinks="false"
                >
                  Create a Data Portal
                </Button>
              )}
            </TopRow>

            <ListSection>
              <ListSectionTitle>Main</ListSectionTitle>
              <MainDataPortalItem />
            </ListSection>
            {isLoading ? (
              <PageLoaderWrapper>
                <Loader />
              </PageLoaderWrapper>
            ) : (
              <ListSection>
                {data?.length === 0 && (
                  <AlertText>You have no Data Portals</AlertText>
                )}
                <ListSectionTitle>{user?.isAdmin ? 'All Data Portals' : 'Your Data Portals'}</ListSectionTitle>
                <List>
                  {data?.map(portal => (
                    <DataPortalListItem key={portal.id} dataPortal={portal} />
                  ))}
                </List>
              </ListSection>
            )}
          </PageMainBody>
        </StyledPageCenter>
      </PageContainerMargin>
    </UserLayout>
  )
}

export default DataPortalsListPage
