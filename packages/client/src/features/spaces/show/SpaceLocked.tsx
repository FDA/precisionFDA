import React from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { AlertText, Col, Warning } from '../../../components/NotAllowed'
import { PageContainer } from '../../../components/Page/styles'
import { ISpace } from '../spaces.types'
import { ActionButton } from './styles'


export const ButtonWrapper = styled.div`
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
`

// if the space is populated with data, the user is RSA and can unlock it.
export function SpaceLocked({ space }: { space?: ISpace }) {
  const navigate = useNavigate()

  return (
    <PageContainer>
      <Col>
        <Warning>
          <div>
            <AlertText>The space is currently locked.</AlertText>
            {space &&
                <ButtonWrapper>
                    <ActionButton data-testid="edit-space-button" onClick={() => navigate(`/spaces/${space.id}/edit`)}>
                        Space Settings </ActionButton>
                </ButtonWrapper>
            }
          </div>
        </Warning>
      </Col>
    </PageContainer>
  )
}
