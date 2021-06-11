import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'

import history from '../../../../utils/history'
import { NewsListItem, NewsListItemLarge } from '../NewsListItem'
import { INewsItem } from '../../../../types/newsItem'
import { IPagination } from '../../../../types/pagination'
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
import { StyledNewsListContainer } from './styles'


interface INewsListProps {
  listItemComponent: typeof NewsListItem,
  newsItems: INewsItem[],
  isFetching: boolean,
  filter?: (item: INewsItem[]) => INewsItem[],
  allowPagination?: boolean,
  pagination?: IPagination,
  setPageHandler?: (page: number) => void,
}


const NewsList: FunctionComponent<INewsListProps> = ({ newsItems, isFetching, listItemComponent=NewsListItemLarge, filter, allowPagination=true, pagination, setPageHandler }: INewsListProps) => {

  if (isFetching) {
    return (
      <div className='text-center'>
        <Loader />
      </div>
    )
  }

  if (newsItems.length) {
    let itemsToShow = newsItems
    if (filter) {
      itemsToShow = filter(newsItems)
    }
    const ListItem = listItemComponent

    return (
      <StyledNewsListContainer>
        <ul className="news-list">
          {itemsToShow.map((newsItem) => <ListItem key={newsItem.id} newsItem={newsItem} />)}
        </ul>
        {allowPagination ??
          <Pagination data={pagination} setPageHandler={setPageHandler} />
        }
      </StyledNewsListContainer>
    )
  }

  return <div className='text-center'>No news found.</div>
}

NewsList.defaultProps = {
  newsItems: [],
  listItemComponent: NewsListItemLarge,
  isFetching: false,
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
