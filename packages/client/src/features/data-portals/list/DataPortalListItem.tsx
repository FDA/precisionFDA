import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { DataPortal } from '../types'

const StyledDataPortalListItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid #b6c8d2;
  padding: 12px;
  border-radius: 12px;
  max-width: 700px;

  &:hover {
    background-color: #f3f8fb;
  }

  @media (min-width: 600px) {
    flex-direction: row;
    gap: 32px;
  }
`

const PortalImage = styled.div`
  img {
    align-self: center;
    border-radius: 12px;
    width: 110px;
    height: 110px;
    object-fit: cover;
  }
`

const PortalItemBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-height: 110px;
  gap: 8px;
`

const Title = styled.div`
  font-size: 24px;
  font-weight: 600;
  line-height: 20px;
  color: #667070;
  margin-top: 8px;
`

const Content = styled.p`
  font-size: 14px;
  color: #7f8c9b;
  line-height: 150%;
  margin: 6px 0;
  width: 100%;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`

export const DataPortalListItem = ({
  dataPortal,
}: {
  dataPortal: DataPortal
}) => (
  <StyledDataPortalListItem as={Link} to={`/data-portals/${dataPortal.urlSlug}`}>
    <PortalImage>
      <img
        width="100%"
        src={dataPortal.cardImageUrl}
        alt="data portal thumbnail"
      />
    </PortalImage>
    <PortalItemBody>
      <Title>{dataPortal.name}</Title>
      <Content>{dataPortal.description}</Content>
      <Content>/{dataPortal.urlSlug}</Content>
    </PortalItemBody>
  </StyledDataPortalListItem>
)
