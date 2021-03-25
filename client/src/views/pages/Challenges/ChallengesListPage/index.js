import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import PublicLayout from '../../../layouts/PublicLayout'
import NavigationBarPublic from '../../../components/NavigationBar/NavigationBarPublic'
import ChallengesList from '../../../components/Challenges/ChallengesList'
import ChallengesYearList from '../../../components/Challenges/ChallengesYearList'
import CollapsibleMenu from '../../../components/CollapsibleMenu'
import {
  fetchChallenges,
  challengesSetYear,
  challengesListResetFilters,
} from '../../../../actions/challenges'
import './style.sass'
import { contextUserSelector } from '../../../../reducers/context/selectors'


class ChallengesListPage extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const { loadChallenges, setYearHandler } = this.props

    const params = new URLSearchParams(location.search)
    const year = params.get('year')
    if (year) {
      setYearHandler(year)
    }
    else {
      loadChallenges()
    }
  }

  render() {
    const { loadChallenges, setYearHandler, resetFilters, user } = this.props

    const title = 'Challenges'
    const subtitle = 'Advancing regulatory standards for bioinformatics, RWD, and AI, through community-sourced science.'
    const sideMenuOptions = [
      {
        text: 'Currently Open',
        onClick: () => {
          resetFilters()
          loadChallenges()
        },
      },
      {
        text: 'Upcoming',
        onClick: () => {
          resetFilters()
          loadChallenges()
        },
      },
      {
        text: 'Propose a Challenge',
        target: '/challenges/propose',
      },
    ]

    const userCanCreateChallenge = user && user.can_create_challenges

    return (
      <PublicLayout>
        <NavigationBarPublic title={title} subtitle={subtitle} />

        <div className="challenges-page-layout">
          <div className="left-column">
            <ChallengesList />
          </div>
          <div className="right-column right-column--override pfda-main-content-sidebar">
            {userCanCreateChallenge && (
              <button className="btn btn-primary btn-block" onClick={() => window.location.assign('/challenges/new')}>Create a new challenge</button>
            )}
            <CollapsibleMenu title="CHALLENGES" options={sideMenuOptions} />
            <hr />
            <div className="pfda-subsection-heading">PREVIOUS CHALLENGES</div>
            <ChallengesYearList setYearHandler={setYearHandler} />
            <hr />
            <div className="pfda-subsection-heading">PROPOSE A CHALLEGNE</div>
            <p>If you have an idea, an objective, a dataset, an algorithm, or any combination of the above that you would like to put in front of the precisionFDA expert community.</p>
            <Link to={{ pathname: '/challenges/propose' }}>
              Propose a Challenge &rarr;
            </Link>
          </div>
        </div>
      </PublicLayout>
    )
  }
}

ChallengesListPage.propTypes = {
  loadChallenges: PropTypes.func,
  setYearHandler: PropTypes.func,
  resetFilters: PropTypes.func,
  user: PropTypes.object,
}

ChallengesListPage.defaultProps = {
  loadChallenges: () => {},
  setYearHandler: () => {},
  resetFilters: () => {},
}

const mapStateToProps = state => ({
  user: contextUserSelector(state),
})

const mapDispatchToProps = dispatch => ({
  loadChallenges: () => dispatch(fetchChallenges()),
  resetFilters: () => dispatch(challengesListResetFilters()),
//   filterChallenges: (searchString) => dispatch(searchChallengesList(searchString)),
  setYearHandler: (year) => {
    dispatch(challengesSetYear(year))
    dispatch(fetchChallenges())
  },
})

export {
  ChallengesListPage,
}

export default connect(mapStateToProps, mapDispatchToProps)(ChallengesListPage)
