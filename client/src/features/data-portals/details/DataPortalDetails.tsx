import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { PageContainerMargin } from '../../../components/Page/styles'
import {
  ListItem,
  NoContent,
  PageMainBody,
  RightList,
  RightSide,
  RightSideItem,
} from '../../../components/Public/styles'
import { CardDetails, DataPortalCard, StyledCard } from '../DataPortalCard'
import { DataPortal } from '../types'
import { AlertText } from './DataPortalNotFound'

import { theme } from '../../../styles/theme'
import '../../lexi/themes/PlaygroundEditorTheme.css'

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

    ${CardDetails} {
      align-self: flex-start;
    }

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
  max-width: 900px;
  font-size: 15px;
  color: var(--c-text-700);
  line-height: 1.7;
  font-weight: 400;

  details {
    background: var(--tertiary-50);
    border: 1px solid var(--tertiary-100);
    border-radius: 10px;
    margin-bottom: 8px;
  }
  summary {
    cursor: pointer;
    padding: 5px 5px 5px 20px;
    position: relative;
    font-weight: bold;
    outline: none;
  }
  [data-lexical-collapsible-content] {
    padding: 0 5px 5px 20px;
  }

  table, tbody, tr, td, th {
    border: 1px solid var(--c-layout-border) !important; 
  }

  .PlaygroundEditorTheme__layoutItem {
    border: 0px;
  }
`

export const DataPortalDetails = ({
  portal,
  canViewResources = true,
  canEditSettings = false,
  canEditContent = false,
  canListPortals = false,
}: {
  portal: DataPortal
  canViewResources: boolean
  canEditSettings: boolean
  canEditContent: boolean
  canListPortals?: boolean
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
            dangerouslySetInnerHTML={{ __html: portal.content ?? '' }}
          />
        </PageMainBody>
        <RightSide>
          <RightSideItem>
            <DataPortalCard
              portal={portal}
              canViewSpaceLink={canEditSettings}
            />
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
              {canListPortals && (
                <ListItem to="/data-portals">
                  <span className="fa fa-file-code-o fa-fw" /> List All Portals
                </ListItem>
              )}
            </RightList>
          </RightSideItem>
        </RightSide>
      </StyledPageRow>
    </PageContainerMargin>
  )
}
