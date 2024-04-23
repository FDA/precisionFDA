import React from 'react'
import styled from 'styled-components'
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
  text-align: center;
  text-wrap: pretty;
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

export function DataPortalError({ message }: { message: string }) {
  return (
    <PageContainerMargin>
      <Content>
        <Col>
          <Warning>
            <div>
              <AlertText>{message}</AlertText>
            </div>
          </Warning>
        </Col>
      </Content>
    </PageContainerMargin>
  )
}
