import React from 'react'
import styled from 'styled-components'
import { PageContainer } from '../../../components/Page/styles'


const AcceptSpaceWarning = styled.div`
  border: solid 1px #f0ad4e;
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: flex-end;
`
const AlertText = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
`
const ActionText = styled.div`
  font-size: 14px;
`
const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-top: 64px;
`

export function SpaceNotAllowed() {
  return (
    <PageContainer>
      <Col>
        <AcceptSpaceWarning>
          <div>
            <AlertText>Unable to view this space.</AlertText>
            <ActionText>You may not have correct access rights</ActionText>
          </div>
        </AcceptSpaceWarning>
      </Col>
    </PageContainer>
  )
}
