import React from 'react'
import styled from 'styled-components'
import { PageContainer } from './Page/styles'

export const Warning = styled.div`
  border: solid 1px #f0ad4e;
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: flex-end;
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
  gap: 32px;
  margin-top: 64px;
`

export function NotAllowedPage({ info = 'Unable to view this page.', description }: { info?: string, description?: string }) {
  return (
    <PageContainer>
      <Col>
        <Warning>
          <div>
            <AlertText>{info}</AlertText>
            {description && <ActionText>{description}</ActionText>}
          </div>
        </Warning>
      </Col>
    </PageContainer>
  )
}
