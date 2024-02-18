import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import {
  ListItem,
  NoContent,
  RightList,
  RightSideItem,
  RightSideScroll,
} from '../../../components/Public/styles'
import { DataPortalCard } from '../DataPortalCard'
import { DataPortal } from '../types'
import { AlertText } from './DataPortalNotFound'

import { AddIdsToHeaders } from '../../../components/Markdown/AddIdsToHeaders'
import '../../lexi/themes/PlaygroundEditorTheme.css'
import { ToC, useMarkdownToc } from '../../markdown/TocNext'
import { compactScrollBarV2 } from '../../../components/Page/styles'

const Row = styled.div`
  display: flex;
  align-items: stretch;
  flex: 1 1 auto;
  flex-direction: row;
  height: 0;
`
const PageWrap = styled.div`
  display: grid;
  justify-content: center;
  flex: 1;
  margin-inline: auto;
${compactScrollBarV2}
overflow-y: scroll;
`
const DataPortalPageMainBody = styled.div`
  padding: 32px;

`
const StyledInnerHTML = styled.div`
  max-width: 900px;
  font-size: 15px;
  color: var(--c-text-700);
  line-height: 1.7;
  font-weight: 400;

  img, picture, svg, video {
    display: inline-block;
  }

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
  
  table,
  tbody,
  tr,
  td,
  th {
    border: 1px solid var(--c-layout-border) !important;
  }

  .PlaygroundEditorTheme__layoutItem {
    border: 0px;
  }

  h1, h2, h3, h4 {
    font-weight: bold;
  }
  h1 {
    font-size: 24px;
  }
  h2 {
    font-size: 20px;
  }
  h3 {
    font-size: 18px;
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
  const docRef = useRef(null)
  const toc = useMarkdownToc(docRef, portal.content ?? '')

  return (
    <Row>
      <RightSideScroll>
        <RightSideItem>
          <DataPortalCard portal={portal} canViewSpaceLink={canEditSettings} />
        </RightSideItem>
        <RightSideItem>
          <ToC items={toc} />
        </RightSideItem>
        {canEditSettings && (
          <RightSideItem>
            <RightList>
              <ListItem as={Link} to={`/data-portals/${portal.id}/edit`}>
                <span className="fa fa-cog fa-fw" /> Portal Settings
              </ListItem>
              {canEditContent && (
                <ListItem to={`/data-portals/${portal.id}/content`}>
                  <span className="fa fa-file-code-o fa-fw" /> Edit Content
                </ListItem>
              )}
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
            {canListPortals && (
              <ListItem to="/data-portals">
                <span className="fa fa-file-code-o fa-fw" /> List All Portals
              </ListItem>
            )}
          </RightList>
        </RightSideItem>
      </RightSideScroll>
      <PageWrap>
        <DataPortalPageMainBody ref={docRef}>
          {!portal.content && (
            <NoContent>
              <AlertText>This Data Portal has no content</AlertText>
              {canEditContent && (
                <Button as={Link} type="button" to={`/data-portals/${portal.id}/content`}>
                  Add some here
                </Button>
              )}
            </NoContent>
          )}
          <AddIdsToHeaders as={StyledInnerHTML} docRef={docRef} content={portal.content ?? ''} />
        </DataPortalPageMainBody>
      </PageWrap>
    </Row>
  )
}
