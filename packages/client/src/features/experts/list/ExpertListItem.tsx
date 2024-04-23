import { format } from 'date-fns'
import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/Button'
import { Content, ItemBody, Title } from '../../../components/Public/styles'
import { Expert } from '../types'
import { ExpertButtonRow, ExpertButtonRowWrap, Info, ItemImage, Name, StyledExpertListItem } from './styles'

export const ExpertListItem = ({ expert, isAdmin = false }: { expert: Expert, isAdmin?: boolean }) => (
  <StyledExpertListItem>
    <ItemImage>
      <img src={expert.image} alt="Experts profile" />
    </ItemImage>
    <ItemBody>
      <Title>{expert.meta.blogTitle}</Title>
      <Info>
        <Name>{expert.meta.title}</Name>
        {format(new Date(expert.createdAt), 'MMM dd, yyyy')}
      </Info>
      <Content>{expert.meta.blogPreview}</Content>
      <ExpertButtonRowWrap>
        <ExpertButtonRow>
          <Button onClick={() => window.location.assign(`/experts/${expert.id}/qa`)}>
            Expert Q&amp;A
          </Button>
          <Link to={`/experts/${expert.id}`}>
            <span
              aria-label={`Click to view more information about ${expert.meta.title}`}
            >
              ☆ About This Expert
            </span>
          </Link>
          <Link to={`/experts/${expert.id}/blog`}>
            <span aria-label={`Click to read ${expert.meta.title}'s blog post`}>
              Read Expert Blog Post &#x2197;
            </span>
          </Link>
        </ExpertButtonRow>
        {isAdmin && (
          <ExpertButtonRow>
            <Button
              as="a"
              href={`/experts/${expert.id}/edit`}
              aria-label={`Click here to Edit the Expert ${expert.id}`}
            >
              <span className="fa fa-pencil fa-fw" />
              Edit Expert
            </Button>
            <Button
              as="a"
              href={`/experts/${expert.id}/dashboard`}
              aria-label={`Click here to View ${expert.id}'s Dashboard`}
            >
              <span className="fa fa-dashboard fa-fw" />
              Dashboard
            </Button>
          </ExpertButtonRow>
        )}
      </ExpertButtonRowWrap>
    </ItemBody>
  </StyledExpertListItem>
)
