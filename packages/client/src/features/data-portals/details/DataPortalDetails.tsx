import React, { useRef } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { Button } from '../../../components/Button'
import { ListItem, NoContent, RightList } from '../../../components/Public/styles'
import { DataPortalCard } from '../DataPortalCard'
import { DataPortal } from '../types'
import { AlertText } from './DataPortalNotFound'

import { AddIdsToHeaders } from '../../../components/Markdown/AddIdsToHeaders'
import { Filler } from '../../../components/Page/styles'
import '../../lexi/themes/PlaygroundEditorTheme.css'
import { ToC, useMarkdownToc } from '../../markdown/TocNext'
import { useDataPortalResourceModal } from '../../resources/useDataPortalResourceModal'
import DataPortalContentEditPage from '../form/DataPortalContentEditPage'
import { BodyContent, DataPortalPageMainBody, PageWrap, RightSideItem, RightSideScroll, Row, StyledInnerHTML } from './styles'


export const DataPortalDetails = ({
  portal,
  canViewResources = true,
  canViewSpaceLink = false,
  canEditSettings = false,
  canEditContent = false,
  canListPortals = false,
}: {
  portal: DataPortal
  canViewResources: boolean
  canViewSpaceLink: boolean
  canEditSettings: boolean
  canEditContent: boolean
  canListPortals?: boolean
}) => {
  const docRef = useRef(null)
  const toc = useMarkdownToc(docRef, portal.content ?? '')
  const { modalComp, setShowModal } = useDataPortalResourceModal()

  return (
    <Row>
      <RightSideScroll>
        <RightSideItem>
          <DataPortalCard portal={portal} canViewSpaceLink={canViewSpaceLink} />
        </RightSideItem>
        <RightSideItem>
          <ToC items={toc} />
        </RightSideItem>
        {canEditSettings && (
          <RightSideItem>
            <RightList>
              <ListItem as={Link} to={`/data-portals/${portal.urlSlug}/edit`}>
                <span className="fa fa-cog fa-fw" /> Portal Settings
              </ListItem>
              {canEditContent && (
                <ListItem to={`/data-portals/${portal.urlSlug}/content`}>
                  <span className="fa fa-file-code-o fa-fw" /> Edit Content
                </ListItem>
              )}
            </RightList>
          </RightSideItem>
        )}
        <RightSideItem>
          {modalComp}
          <RightList>
            {canViewResources && (
              <ListItem as="a" onClick={() => setShowModal(true)}>
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
        <Routes>
          <Route
            path="/"
            element={
              <DataPortalPageMainBody ref={docRef}>
                <BodyContent>
                  {!portal.content && (
                    <NoContent>
                      <AlertText>This Data Portal has no content</AlertText>
                      {canEditContent && (
                        <Button as={Link} type="button" to={`/data-portals/${portal.urlSlug}/content`}>
                          Add some here
                        </Button>
                      )}
                    </NoContent>
                  )}
                  <AddIdsToHeaders as={StyledInnerHTML} docRef={docRef} content={portal.content ?? ''} />
                  <Filler $size={40} />
                </BodyContent>
              </DataPortalPageMainBody>
            }
          />
          <Route path="content" element={<DataPortalContentEditPage />} />
        </Routes>
      </PageWrap>
    </Row>
  )
}
