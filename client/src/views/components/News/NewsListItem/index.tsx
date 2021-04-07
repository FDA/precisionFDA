import React, { Component } from 'react'
import { format } from 'date-fns'

import { INewsItem } from '../../../../types/newsItem'
import styled from 'styled-components'
import { theme } from '../../../../styles/theme'
import { commonStyles } from '../../../../styles/commonStyles'
import ExternalLink from '../../Controls/ExternalLink'


interface INewsListItemProps {
  newsItem: INewsItem,
}


class NewsListItem extends Component<INewsListItemProps> {
}

const StyledNewsListItemSmall = styled.div`
  margin-bottom: ${theme.padding.contentMarginLarge};

  .news-item-title {
    color: ${theme.colors.textBlack};
    font-size: 14px;
    font-weight: bold;
    line-height: 133%;
    margin: 0px 0 6px 0;
  }

  a {
    font-size: 13px;
  }

  .news-item-date {
    flex-grow: 1;
    flex-shrink: 1;
    color: ${theme.colors.textMediumGrey};
    font-size: 13px;
  }
`

class NewsListItemSmall extends NewsListItem {
  render() {
    const newsItem = this.props.newsItem

    return (
      <StyledNewsListItemSmall>
        <div className='news-item-title'>{newsItem.title}</div>
        <div style={{ display: 'flex' }}>
          <div className='news-item-date'>{format(newsItem.createdAt, 'MMM dd, yyyy')}</div>
          <ExternalLink to={newsItem.link}>View &rarr;</ExternalLink>
        </div>
      </StyledNewsListItemSmall>
    )
  }
}


const StyledNewsListItemLarge = styled.div`
  display: flex;
  flex-flow: row nowrap;
  list-style: none;
  margin-bottom: ${theme.padding.mainContentVertical};

  hr {
    border: 0.5px solid ${theme.colors.textMediumGrey};
    margin-top: 4px;
    margin-bottom: 8px;
  }

  .news-item-date {
    ${commonStyles.sectionHeading};
    text-transform: uppercase;
    margin-top: 0;
  }

  .news-item-image {
    cursor: pointer;
    padding: 0px;

    img {
      width: ${theme.sizing.thumbnailWidth};
      height: ${theme.sizing.thumbnailHeight};
      object-fit: cover;
      overflow: hidden;
    }
  }
`

const LeftColumn = styled.div`
  width: ${theme.sizing.smallColumnWidth};
  flex: 0 0 ${theme.sizing.smallColumnWidth};
  align-items: flex-start;
  padding: 0;
  margin-right: ${theme.padding.mainContentHorizontal};
`

const RightColumn = styled.div`
  flex-grow: 1;
  align-items: flex-start;
  padding-left: 0;
  padding-right: ${theme.padding.mainContentHorizontal};
`

class NewsListItemLarge extends NewsListItem {
  render() {
    const newsItem = this.props.newsItem

    return (
      <StyledNewsListItemLarge>
        <LeftColumn>
          <hr/>
          <div className='news-item-date'>{format(newsItem.createdAt, 'MMM dd, yyyy')}</div>
        </LeftColumn>
        <RightColumn>
          <h1>{newsItem.title}</h1>
          <p>{newsItem.content}</p>
          {newsItem.video && (
          <div style={{ marginBottom: "6px" }}>
            <iframe width="600" height="300" src={newsItem.video} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
          </div>
          )}
          <ExternalLink to={newsItem.link}>View News Source &#x2197;</ExternalLink>
        </RightColumn>
      </StyledNewsListItemLarge>
    )
  }
}

export {
  NewsListItem,
  NewsListItemSmall,
  NewsListItemLarge,
}
export type {
  INewsListItemProps,
}

export default NewsListItem
