import React from 'react'
import { ActionText, AlertText, Col, Warning } from '../../../components/NotAllowed'
import { PageContainer } from '../../../components/Page/styles'


export function SpaceNotAllowed() {
  return (
    <PageContainer>
      <Col>
        <Warning>
          <div>
            <AlertText>Unable to view this space.</AlertText>
            <ActionText>You may not have correct access rights</ActionText>
          </div>
        </Warning>
      </Col>
    </PageContainer>
  )
}
