import { format } from 'date-fns'
import React from 'react'
import styled from 'styled-components'
import { Loader } from '../../components/Loader'
import { useNewsListQuery } from '../news/useNewsListQuery'
import ExternalLink from '../../components/Controls/ExternalLink'

export const StyledCondensedList = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: column;
  margin-bottom: 16px;
`

export const ExpertImageCircleSmall = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%;
`

export const NewsItemComp = styled.div`
  display: flex;
  flex-direction: column;
`

export const Name = styled.div`
  font-size: 13px;
  font-weight: bold;
`

export const Info = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: #646464;
`

export const OverviewNewsList = ({ pick = 3 }: { pick?: number }) => {
  const { data, isLoading } = useNewsListQuery({ orderBy: 'isPublication' })
  if (isLoading) return <Loader className="inline" />
  const newsList = pick ? data?.data?.slice(0, pick) : data?.data

  return (
    <StyledCondensedList>
      {newsList?.map(n => (
        <NewsItemComp key={n.id}>
          <Name>{n.title}</Name>
          <Info>
            <div>{format(new Date(n.createdAt), 'MMM dd, yyyy')}</div>
            <ExternalLink to={n.link}>View &#x2192;</ExternalLink>
          </Info>
        </NewsItemComp>
      ))}
    </StyledCondensedList>
  )
}
