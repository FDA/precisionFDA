import React from 'react'
import { Link } from 'react-router'
import styled from 'styled-components'
import precisionFDADataPortal from '../../assets/precisionFDA-dp.png'
import { Button } from '../../components/Button'
import { DataPortal } from './types'

export const StyledCard = styled.div`
  gap: 16px;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  padding: 12px;
  padding-bottom: 0;
  padding-top: 32px;
  align-items: center;

  img {
    flex: 1 0 auto;
    border-radius: 12px;
    width: 220px;
    max-width: 220px;
    height: 220px;
    object-fit: cover;
  }
`

export const CardDetails = styled.div`
  padding: 0 8px 8px 8px;
  max-width: 220px;
`

const CardName = styled.div`
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 12px;
  text-wrap: pretty;
`

const CardDesc = styled.div`
  font-size: 14px;
  color: #7f8c9b;
  line-height: 150%;
  margin-bottom: 16px;
  text-wrap: pretty;
`

export const DataPortalCard = ({ portal, canViewSpaceLink = false }: { portal: DataPortal; canViewSpaceLink: boolean }) => {
  return (
    <StyledCard>
      <img width="100%" src={portal.cardImageUrl ?? precisionFDADataPortal} alt="Portal Cover" />

      <CardDetails>
        <CardName>{portal.name}</CardName>
        <CardDesc>{portal.description}</CardDesc>
        {canViewSpaceLink && (
          <Button as={Link} to={`/spaces/${portal.spaceId}`}>
            Go to Portal Space
          </Button>
        )}
      </CardDetails>
    </StyledCard>
  )
}
