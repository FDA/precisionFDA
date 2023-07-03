import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Button } from '../../components/Button'
import { DataPortal } from './types'

export const StyledCard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border: 1px solid #b6c8d2;
  padding: 8px;
  padding-top: 16px;
  border-radius: 12px;

  img {
    flex: 1 0 auto;
    align-self: center;
    border-radius: 12px;
    width: 220px;
    height: 220px;
    object-fit: cover;
  }
`

export const CardDetails = styled.div`
  align-self: center;
  padding: 16px 8px 8px 8px;
  max-width: 220px;
`

const CardName = styled.div`
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 12px;
`

const CardDesc = styled.div`
  font-size: 14px;
  color: #7f8c9b;
  line-height: 150%;
  margin-bottom: 12px;
`

export const DataPortalCard = ({ portal }: { portal: DataPortal }) => {
  return (
    <StyledCard>
      <img src={portal.cardImageUrl} alt="Portal Cover" />

      <CardDetails>
        <CardName>{portal.name}</CardName>
        <CardDesc>{portal.description}</CardDesc>
        <Button as={Link} to={`/spaces/${portal.spaceId}`}>
          Go to Portal Space
        </Button>
      </CardDetails>
    </StyledCard>
  )
}
