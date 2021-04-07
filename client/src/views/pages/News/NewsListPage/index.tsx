import React, { Component } from 'react'
import { connect } from 'react-redux'

import PublicLayout from '../../../layouts/PublicLayout'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import NewsList from '../../../components/News/NewsList'
import NewsYearList from '../../../components/News/NewsYearList'
import {
  fetchNews,
  newsListResetFilters,
  newsListSetYear
} from '../../../../actions/news'
import './style.sass'
import { contextUserSelector } from '../../../../reducers/context/selectors'
import { NewsListItemLarge } from '../../../components/News/NewsListItem'
import { SectionHeading } from '../../../components/Controls/SectionHeading'
import { newsListYearSelector } from '../../../../reducers/news/list/selectors'


interface INewsListPageProps {
  loadNews: () => void,
  resetFilters: () => void,
  setYearHandler: (year: number) => void,
  user: any,
  year: number | null,
}


class NewsListPage extends Component<INewsListPageProps> {
  static defaultProps = {
    loadNews: () => {},
    resetFilters: () => {},
    setYearHandler: () => {},
  }

  componentDidMount() {
    const { loadNews, setYearHandler } = this.props

    const params = new URLSearchParams(location.search)
    const year = params.get("year")
    if (year && !isNaN(parseInt(year))) {
      setYearHandler(parseInt(year))
    }
    else {
      loadNews()
    }
  }

  render() {
    const { loadNews, resetFilters, setYearHandler, user, year } = this.props

    const userCanCreateNews = user && user.can_administer_site

    const filterActive = year
    const handleResetClicked = () => {
      resetFilters()
      loadNews()
    }

    const title = 'News'
    const subtitle = 'Announcements and press for precisionFDA.'

    return (
      <PublicLayout>
        <NavigationBar title={title} subtitle={subtitle} user={user} />

        <div className="challenges-page-layout">
          <div className="left-column">
            {filterActive &&
              <a onClick={handleResetClicked}>&larr; Back to All News</a>
            }
            <NewsList listItemComponent={NewsListItemLarge} />
          </div>
          <div className="right-column right-column--override pfda-main-content-sidebar">
            {userCanCreateNews && (
              <>
              <button className='btn btn-primary btn-block' onClick={() => window.location.assign('/admin/news/new')}>New article</button>
              <button className='btn btn-primary btn-block' onClick={() => window.location.assign('/admin/news')}>Administer News</button>
              </>
            )}
            <SectionHeading>NEWS BACKLOG</SectionHeading>
            <NewsYearList setYearHandler={setYearHandler} />
            <hr />
            <SectionHeading>COMMUNITY NEWS</SectionHeading>
            <p>If you have newsworthy updates of value to the precisionFDA community, let us know!</p>
          </div>
        </div>
      </PublicLayout>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => ({
  loadNews: () => dispatch(fetchNews()),
  resetFilters: () => dispatch(newsListResetFilters()),
  setYearHandler: (year: number) => {
    dispatch(newsListSetYear(year))
    dispatch(fetchNews())
  },
})

const mapStateToProps = (state: any) => ({
  user: contextUserSelector(state),
  year: newsListYearSelector(state),
})

export {
  NewsListPage,
}

export default connect(mapStateToProps, mapDispatchToProps)(NewsListPage)
