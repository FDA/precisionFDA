import React from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Loader } from '../../../components/Loader'
import { PageContainerMargin } from '../../../components/Page/styles'
import {
  ListItem,
  NoContent,
  PageMainBody,
  RightList,
  RightSide,
  RightSideItem,
} from '../../../components/Public/styles'
import { UserLayout } from '../../../layouts/UserLayout'
import { CardDetails, DataPortalCard, StyledCard } from '../DataPortalCard'
import { useDataPortalByIdQuery } from '../queries'
import { DataPortal } from '../types'
import { AlertText, DataPortalNotFound } from './DataPortalNotFound'
import { Button } from '../../../components/Button'
import { useAuthUser } from '../../auth/useAuthUser'

import '../../lexi/themes/PlaygroundEditorTheme.css'
import { theme } from '../../../styles/theme'
import { canEditSettings as canEditSettingsCheck, canEditContent as canEditContentCheck } from '../utils'

const StyledPageRow = styled.div`
  display: flex;
  flex-direction: column-reverse;
  width: 100%;
  gap: 32px;
  padding: 32px 0;
  position: initial;

  ${RightSide} {
    order: 0;
  }

  ${StyledCard} {
    flex-direction: row;
    gap: 16px;
  }

  ${CardDetails} {
    max-width: unset;
  }

  @media (min-width: ${theme.breakPoints.large}px) {
    flex-direction: row-reverse;
    gap: 64px;

    ${StyledCard} {
      flex-direction: column;
    }

    ${RightSide} {
      order: 2;
      flex: 0 1 auto;
      min-width: 256px;
      max-width: 256px;
      position: sticky;
      top: 32px;
      height: 100%;
    }
  }

  ${RightSideItem} {
    border-bottom-width: 0;
    padding-bottom: 16px;
  }
`
const StyledInnerHTML = styled.div`
  border-radius: 2px;
  max-width: 900px;
  color: #000;
  position: relative;
  line-height: 1.7;
  font-weight: 400;
  font-size: 15px;
`

export const DataPortalDetails = ({
  portal,
  canViewResources = true,
  canEditSettings = false,
  canEditContent = false,
}: {
  portal: DataPortal
  canViewResources: boolean
  canEditSettings: boolean
  canEditContent: boolean
}) => {
  return (
    <PageContainerMargin>
      <StyledPageRow>
        <PageMainBody>
          {!portal.content && (
            <NoContent>
              <AlertText>This Data Portal has no content</AlertText>
              {canEditContent && (
                <Button
                  as={Link}
                  type="button"
                  to={`/data-portals/${portal.id}/content`}
                >
                  Add some here
                </Button>
              )}
            </NoContent>
          )}
          <StyledInnerHTML
            dangerouslySetInnerHTML={{ __html: portal.content }}
          />
        </PageMainBody>
        <RightSide>
          <RightSideItem>
            <DataPortalCard portal={portal} />
          </RightSideItem>
          {canEditSettings && (
            <RightSideItem>
              <RightList>
                <ListItem as={Link} to={`/data-portals/${portal.id}/edit`}>
                  <span className="fa fa-cog fa-fw" /> Portal Settings
                </ListItem>
              </RightList>
            </RightSideItem>
          )}
          <RightSideItem>
            <RightList>
              {canViewResources && (
                <ListItem as={Link} to={`/data-portals/${portal.id}/resources`}>
                  <span className="fa fa-file-code-o fa-fw" /> Resources
                </ListItem>
              )}
              {canEditContent && (
                <ListItem to={`/data-portals/${portal.id}/content`}>
                  <span className="fa fa-file-code-o fa-fw" /> Edit Content
                </ListItem>
              )}
            </RightList>
          </RightSideItem>
        </RightSide>
      </StyledPageRow>
    </PageContainerMargin>
  )
}

const DataPortalDetailsPage = () => {
  const user = useAuthUser()
  const { portalId } = useParams<{
    portalId: string
    page?: string
  }>()
  const { data, isLoading, error } = useDataPortalByIdQuery(portalId)

  if (!isLoading && !data && error) {
    return (
      <UserLayout>
        <DataPortalNotFound message={error?.response?.data?.error?.message} />
      </UserLayout>
    )
  }

  return (
    <UserLayout>
      {isLoading || !data ? (
        <PageContainerMargin>
          <Loader />
        </PageContainerMargin>
      ) : (
        <DataPortalDetails
          portal={data}
          canViewResources
          canEditContent={canEditContentCheck(user?.dxuser, data.members)}
          canEditSettings={canEditSettingsCheck(user?.dxuser, data.members)}
        />
      )}
    </UserLayout>
  )
}

export default DataPortalDetailsPage
