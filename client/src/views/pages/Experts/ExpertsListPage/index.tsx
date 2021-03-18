import React, { Component } from 'react'
import { connect } from 'react-redux'

import PublicLayout from '../../../layouts/PublicLayout'
import { NavigationBarPublic } from '../../../components/NavigationBar/NavigationBarPublic'
import { ExpertsListItemType } from '../../../components/Experts/ExpertsListItem'
import ExpertsList from '../../../components/Experts/ExpertsList'
import ExpertsYearList from '../../../components/Experts/ExpertsYearList'
import {
  fetchExperts,
  expertsListSetYear
} from '../../../../actions/experts'
import './style.sass'

import { contextUserSelector } from '../../../../reducers/context/selectors'


interface IExpertsListPageProps {
  loadExperts: () => void,
  setYearHandler: (year: number) => void,
  user: any,
}


class ExpertsListPage extends Component<IExpertsListPageProps> {
  static defaultProps = {
    loadExperts: () => {},
    setYearHandler: () => {},
  }

  componentDidMount() {
    const { loadExperts, setYearHandler } = this.props

    const params = new URLSearchParams(location.search)
    const year = params.get("year")
    if (year && !isNaN(parseInt(year))) {
      setYearHandler(parseInt(year))
    }
    else {
      loadExperts()
    }
  }

  render() {
    const { setYearHandler, user } = this.props

    const title = 'Expert Blogs'
    const subtitle = 'Insights from academic, industry, and FDA experts from the precisionFDA Community.'

    const userCanCreateExpert = user && user.can_administer_site

    // N.B. Explicitly passing in user={user} in NavigationBarPublic is a workaround:
    //      Unlike ChallengesListPage where the set up is identical, the NavigationBarPublic
    //      here somehow gets an undefined state.context even though fetchContext is successful
    return (
      <PublicLayout>
        <NavigationBarPublic title={title} subtitle={subtitle} user={user} />

        <div className="experts-page-layout">
          <div className="left-column">
            <div className="pfda-subsection-heading expert-highlight-heading">EXPERT HIGHLIGHT</div>
            <ExpertsList listItemType={ExpertsListItemType.BlogEntry} />
          </div>
          <div className="right-column right-column--override pfda-main-content-sidebar">
            {userCanCreateExpert && (
              <button className='btn btn-primary btn-block' onClick={event => window.location.assign('/experts/new')}>Create a new expert</button>
            )}
            <div className="pfda-subsection-heading">PREVIOUS EXPERT BLOGS</div>
            <ExpertsYearList setYearHandler={setYearHandler} />
            <hr />
            <div className="pfda-subsection-heading">EXPERTS</div>
            <ExpertsList listItemType={ExpertsListItemType.QuestionsAndAnswers} />
          </div>
        </div>
      </PublicLayout>
    )
  }
}

const mapStateToProps = (state: any) => ({
  user: contextUserSelector(state)
})

const mapDispatchToProps = (dispatch: any) => ({
  loadExperts: () => dispatch(fetchExperts()),
  setYearHandler: (year: number) => {
    dispatch(expertsListSetYear(year))
    dispatch(fetchExperts())
  },
})

export {
  ExpertsListPage,
}

export default connect(mapStateToProps, mapDispatchToProps)(ExpertsListPage)
