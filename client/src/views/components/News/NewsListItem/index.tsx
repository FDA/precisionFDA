import React, { Component } from 'react'
import classNames from 'classnames/bind'
import history from '../../../../utils/history'

import { INewsItem } from '../../../shapes/NewsItemShape'
import './style.sass'

import { format } from 'date-fns'


type NewsListItemProps = {
  newsItem: INewsItem,
}


class NewsListItem extends Component<NewsListItemProps> {

  render() {
    const newsItem = this.props.newsItem

    const classes = classNames('news-list-item')
    return (
      <div className={classes}>
        <div className='left-column'>
          <hr/>
          <div className='news-item-date'>{format(newsItem.createdAt, 'MMM dd, yyyy')}</div>
        </div>
        <div className='right-column news-item-content'>
          <h1>{newsItem.title}</h1>
          <p>{newsItem.content}</p>
          {newsItem.video && (
          <div style={{ marginBottom: "6px" }}>
            <iframe width="600" height="300" src={newsItem.video} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
          </div>
          )}
          <a href={newsItem.link} target='_blank'>View News Source &#x2197;</a>
        </div>
      </div>
    )
  }
}

export {
  NewsListItem
}

export default NewsListItem
