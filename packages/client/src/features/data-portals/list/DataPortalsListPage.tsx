import { useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import { Link } from 'react-router'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { Loader } from '../../../components/Loader'
import { PageContainerMargin, PageTitle } from '../../../components/Page/styles'
import { PageLoaderWrapper } from '../../../components/Public/styles'
import { usePageMeta } from '../../../hooks/usePageMeta'
import { useLastWSNotification } from '../../../hooks/useLastWSNotification'
import { UserLayout } from '../../../layouts/UserLayout'
import { theme } from '../../../styles/theme'
import { useAuthUser } from '../../auth/useAuthUser'
import { NOTIFICATION_ACTION } from '../../home/types'
import { StyledPageCenter } from '../../spaces/form/styles'
import { dataPortalsListRequest } from '../api'
import { AlertText } from '../details/DataPortalNotFound'
import { DataPortalListItem } from './DataPortalListItem'

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

const DataPortalsListPage = () => {
  const user = useAuthUser()
  usePageMeta({ title: 'Data Portals - precisionFDA' })
  const { data, isLoading } = useQuery({
    queryKey: ['data-portals-list'],
    queryFn: () => dataPortalsListRequest(),
  })
  const queryClient = useQueryClient()

  const lastJsonMessage = useLastWSNotification([NOTIFICATION_ACTION.DATA_PORTAL_CARD_IMAGE_URL_UPDATED])

  useEffect(() => {
    if (lastJsonMessage == null) {
      return
    }
    queryClient.invalidateQueries({ queryKey: ['data-portals-list'] })
  }, [lastJsonMessage])

  return (
    <UserLayout mainScroll>
      <PageContainerMargin>
        <StyledPageCenter>
          <PageMainBody>
            <TopRow>
              <PageTitle>Data Portals</PageTitle>
              {user?.isAdmin && (
                <Button data-variant="primary" as={Link} to="/data-portals/create" data-turbolinks="false">
                  Create a Data Portal
                </Button>
              )}
            </TopRow>

            {isLoading ? (
              <PageLoaderWrapper>
                <Loader />
              </PageLoaderWrapper>
            ) : (
              <ListSection>
                {data?.length === 0 && <AlertText>You have no Data Portals</AlertText>}
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
