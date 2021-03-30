import React, { Component } from 'react'
import { connect } from 'react-redux'

import PublicLayout from '../../../layouts/PublicLayout'
import { NavigationBarPublic } from '../../../components/NavigationBar/NavigationBarPublic'
import NewsList from '../../../components/News/NewsList'
import NewsYearList from '../../../components/News/NewsYearList'
import {
  fetchNews,
  newsListSetYear
} from '../../../../actions/news'
import './style.sass'
import { contextUserSelector } from '../../../../reducers/context/selectors'


interface INewsListPageProps {
  loadNews: () => void,
  setYearHandler: (year: number) => void,
  user: any,
}


class NewsListPage extends Component<INewsListPageProps> {
  static defaultProps = {
    loadNews: () => {},
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
    const { setYearHandler, user } = this.props

    const userCanCreateNews = user && user.can_administer_site

    const title = 'News'
    const subtitle = 'Announcements and press for precisionFDA.'

    // N.B. Explicitly passing in user={user} in NavigationBarPublic is a workaround:
    //      Unlike ChallengesListPage where the set up is identical, the NavigationBarPublic
    //      here somehow gets an undefined state.context even though fetchContext is successful
    return (
      <PublicLayout>
        <NavigationBarPublic title={title} subtitle={subtitle} user={user} />

        <div className="challenges-page-layout">
          <div className="left-column">
            <NewsList />
          </div>
          <div className="right-column right-column--override pfda-main-content-sidebar">
            {userCanCreateNews && (
              <>
              <button className='btn btn-primary btn-block' onClick={() => window.location.assign('/admin/news/new')}>New article</button>
              <button className='btn btn-primary btn-block' onClick={() => window.location.assign('/admin/news')}>Administer News</button>
              </>
            )}
            <div className="pfda-subsection-heading">NEWS BACKLOG</div>
            <NewsYearList setYearHandler={setYearHandler} />
            <hr />
            <div className="pfda-subsection-heading">COMMUNITY NEWS</div>
            <p>If you have newsworthy updates of value to the precisionFDA community, let us know!</p>
          </div>
        </div>
      </PublicLayout>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => ({
  loadNews: () => dispatch(fetchNews()),
  setYearHandler: (year: number) => {
    dispatch(newsListSetYear(year))
    dispatch(fetchNews())
  },
})

const mapStateToProps = (state: any) => ({
  user: contextUserSelector(state),
})

export {
  NewsListPage,
}

export default connect(mapStateToProps, mapDispatchToProps)(NewsListPage)
