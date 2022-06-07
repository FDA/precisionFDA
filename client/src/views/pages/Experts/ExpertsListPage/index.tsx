import React, { Component } from 'react'
import { connect } from 'react-redux'

import PublicLayout from '../../../layouts/PublicLayout'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import { ExpertsListItemBlogEntry, ExpertsListItemQuestionsAndAnswers } from '../../../components/Experts/ExpertsListItem'
import ExpertsList from '../../../components/Experts/ExpertsList'
import ExpertsYearList from '../../../components/Experts/ExpertsYearList'
import {
  fetchExperts,
  expertsListSetYear,
  expertsListResetFilters,
} from '../../../../actions/experts'
import './style.sass'
import { contextUserSelector } from '../../../../reducers/context/selectors'
import { SectionHeading } from '../../../components/Controls/SectionHeading'
import { expertsListYearSelector } from '../../../../reducers/experts/list/selectors'


interface IExpertsListPageProps {
  loadExperts: () => void,
  resetFilters: () => void,
  setYearHandler: (year: number) => void,
  user: any,
  year: number | null,
}


class ExpertsListPage extends Component<IExpertsListPageProps> {
  static defaultProps = {
    loadExperts: () => {},
    resetFilters: () => {},
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
    const { loadExperts, resetFilters, setYearHandler, user, year } = this.props

    const title = 'Expert Blogs'
    const subtitle = 'Insights from academic, industry, and FDA experts from the precisionFDA Community.'

    const userCanCreateExpert = user && user.can_administer_site

    const filterActive = year
    const handleResetClicked = () => {
      resetFilters()
      loadExperts()
    }

    return (
      <PublicLayout>
        <NavigationBar title={title} subtitle={subtitle} user={user} />

        <div className="experts-page-layout">
          <div className="left-column">
            {filterActive &&
              <a onClick={handleResetClicked}>&larr; Back to All Experts</a>
            }
            <div className="expert-highlight-heading">EXPERT HIGHLIGHT</div>
            <ExpertsList listItemComponent={ExpertsListItemBlogEntry} />
          </div>
          <div className="right-column right-column--override pfda-main-content-sidebar">
            {userCanCreateExpert && (
              <button className='btn btn-primary btn-block' onClick={event => window.location.assign('/experts/new')}>Create a new expert</button>
            )}
            <SectionHeading>PREVIOUS EXPERT BLOGS</SectionHeading>
            <ExpertsYearList setYearHandler={setYearHandler} />
            <hr />
            <SectionHeading>EXPERTS</SectionHeading>
            <ExpertsList listItemComponent={ExpertsListItemQuestionsAndAnswers} />
          </div>
        </div>
      </PublicLayout>
    )
  }
}

const mapStateToProps = (state: any) => ({
  user: contextUserSelector(state),
  year: expertsListYearSelector(state),
})

const mapDispatchToProps = (dispatch: any) => ({
  loadExperts: () => dispatch(fetchExperts()),
  resetFilters: () => dispatch(expertsListResetFilters()),
  setYearHandler: (year: number) => {
    dispatch(expertsListSetYear(year))
    dispatch(fetchExperts())
  },
})

export {
  ExpertsListPage,
}

export default connect(mapStateToProps, mapDispatchToProps)(ExpertsListPage)
