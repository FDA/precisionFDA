import { format } from 'date-fns'
import React from 'react'
import styled from 'styled-components'
import { Loader } from '../../components/Loader'
import { colors } from '../../styles/theme'
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

export const NewsItem = styled.div`
  display: flex;
  flex-direction: column;
`

export const Name = styled.div`
  font-size: 13px;
  color: #333333;
  font-weight: bold;
`

export const Info = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: #646464;
`

export const StyledPreview = styled.div`
  font-weight: normal;
  font-size: 12px;
  color: ${colors.textDarkGrey};
  line-height: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`
export const CeatedAtDate = styled.div`
  font-weight: normal;
  font-size: 12px;
  color: ${colors.colorDateGrey};
`

export const ExpertMeta = styled.div`
  display: flex;
  gap: 16px;
  justify-content: space-between;
`

export const OverviewNewsList = ({ pick }: { pick?: number }) => {
  const { data, isLoading } = useNewsListQuery({ orderBy: 'isPublication' })
  if (isLoading) return <Loader displayInline />
  const newsList = pick ? data?.news_items?.slice(0, pick) : data?.news_items

  return (
    <StyledCondensedList>
      {newsList?.map(n => (
        <NewsItem key={n.id}>
          <Name>{n.title}</Name>
          <Info>
            <div>{format(new Date(n.createdAt), 'MMM dd, yyyy')}</div>
            <ExternalLink to={n.link}>View &#x2192;</ExternalLink>
          </Info>
        </NewsItem>
      ))}
    </StyledCondensedList>
  )
}
