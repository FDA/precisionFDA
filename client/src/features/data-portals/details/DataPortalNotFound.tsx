import React from 'react'
import styled from 'styled-components'
import { BackLink } from '../../../components/Page/PageBackLink'
import { PageContainerMargin } from '../../../components/Page/styles'

export const Warning = styled.div`
  border: solid 1px #f0ad4e;
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: flex-end;
  width: fit-content;
`
export const AlertText = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
`
export const ActionText = styled.div`
  font-size: 14px;
`
export const Col = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  margin: 64px 0;
  height: 100%;
  max-width: 500px;
`

export const Content = styled.div`
  display: flex;
  justify-content: center;
  height: 100%;
`

export function DataPortalNotFound({ message }: { message: string }) {
  return (
    <PageContainerMargin>
      <Content>
        <Col>
          <Warning>
            <div>
              <AlertText>Data Portal Not Found</AlertText>
              <BackLink linkTo="/data-portals">
                View other data portals
              </BackLink>
            </div>
          </Warning>
          {message}
        </Col>
      </Content>
    </PageContainerMargin>
  )
}
