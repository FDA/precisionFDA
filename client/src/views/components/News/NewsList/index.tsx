import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'

import history from '../../../../utils/history'
import NewsListItem from '../NewsListItem'
import { INewsItem } from '../../../shapes/NewsItemShape'
import { IPagination } from '../../../shapes/IPagination'
import Pagination from '../../TableComponents/Pagination'
import Loader from '../../Loader'
import {
  fetchNews,
  newsListSetPage,
} from '../../../../actions/news'
import {
  newsListItemsSelector,
  newsListIsFetchingSelector,
  newsListPaginationSelector
} from '../../../../reducers/news/list/selectors'
import './style.sass'


interface INewsListProps {
  newsItems: INewsItem[],
  isFetching: boolean,
  pagination: IPagination,
  setPageHandler: (page: number) => void,
}


const NewsList: FunctionComponent<INewsListProps> = ({ newsItems, isFetching, pagination, setPageHandler }: INewsListProps) => {
  const classes = classNames(['news-list'])

  if (isFetching) {
    return (
      <div className='text-center'>
        <Loader />
      </div>
    )
  }

  if (newsItems.length) {
    return (
      <div>
        <ul className={classes}>
          {newsItems.map((newsItem) => <NewsListItem key={newsItem.id} newsItem={newsItem} />)}
        </ul>
        <Pagination data={pagination} setPageHandler={setPageHandler} />
      </div>
    )
  }

  return <div className='text-center'>No news found.</div>
}

NewsList.defaultProps = {
  newsItems: [],
  isFetching: false
}

const mapStateToProps = (state: any) => ({
  newsItems: newsListItemsSelector(state),
  isFetching: newsListIsFetchingSelector(state),
  pagination: newsListPaginationSelector(state),
})

const mapDispatchToProps = (dispatch: any) => ({
  openNewsItem: (id: number) => history.push(`/news/${id}`),
  setPageHandler: (page: number) => {
    dispatch(newsListSetPage(page))
    dispatch(fetchNews())
  },
})

export {
  NewsList
}

export default connect(mapStateToProps, mapDispatchToProps)(NewsList)
