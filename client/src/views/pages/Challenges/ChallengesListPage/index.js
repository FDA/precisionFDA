import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import PublicLayout from '../../../layouts/PublicLayout'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import ChallengesList from '../../../components/Challenges/ChallengesList'
import ChallengesYearList from '../../../components/Challenges/ChallengesYearList'
import CollapsibleMenu from '../../../components/CollapsibleMenu'
import { ButtonSolidBlue } from '../../../../components/Button'
import { PlusIcon } from '../../../../components/icons/PlusIcon'
import {
  fetchChallenges,
  challengesSetPage,
  challengesSetYear,
  challengesListResetFilters,
  challengesSetTimeStatus,
} from '../../../../actions/challenges'
import './style.sass'
import { contextUserSelector } from '../../../../reducers/context/selectors'
import { CHALLENGE_TIME_STATUS } from '../../../../constants'
import { challengesListTimeStatusSelector, challengesListYearSelector } from '../../../../reducers/challenges/list/selectors'


class ChallengesListPage extends Component {

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

    document.title = 'PrecisionFDA Challenges'
  }

  render() {
    const { loadChallenges, setPageHandler, setYearHandler, setTimeStatusHandler, resetFilters, user, year, timeStatus } = this.props

    const title = 'Challenges'
    const subtitle = 'Advancing regulatory standards for bioinformatics, RWD, and AI, through community-sourced science.'
    const sideMenuOptions = [
      {
        text: 'Currently Open',
        onClick: () => {
          resetFilters()
          setTimeStatusHandler(CHALLENGE_TIME_STATUS.CURRENT)
          loadChallenges()
        },
        entityType: 'Challenges',
      },
      {
        text: 'Upcoming',
        onClick: () => {
          resetFilters()
          setTimeStatusHandler(CHALLENGE_TIME_STATUS.UPCOMING)
          loadChallenges()
        },
        entityType: 'Challenges',
      },
      {
        text: 'Ended',
        onClick: () => {
          resetFilters()
          setTimeStatusHandler(CHALLENGE_TIME_STATUS.ENDED)
          loadChallenges()
        },
        entityType: 'Challenges',
      },
    ]

    const userCanCreateChallenge = user && user.can_create_challenges
    const filterActive = year || timeStatus
    const handleResetClicked = () => {
      resetFilters()
      loadChallenges()
    }

    const getEmptyListMessage = (timeStatus) => {
      switch (timeStatus) {
        case CHALLENGE_TIME_STATUS.CURRENT:
        case CHALLENGE_TIME_STATUS.UPCOMING:
          return `There are no ${timeStatus} challenges on precisionFDA at the moment.  Check back regularly or subscribe to the mailing list to be informed of new community challenges.`
        case CHALLENGE_TIME_STATUS.ENDED:
          return 'No ended challenges.'
        default:
          return 'No challenges found.'
      }
    }

    return (
      <PublicLayout>
        <NavigationBar title={title} subtitle={subtitle} user={user} />

        <div className="challenges-page-layout">
          <div className="left-column">
            {filterActive &&
              <a onClick={handleResetClicked}>&larr; Back to All Challenges</a>
            }
            <ChallengesList emptyListMessage={getEmptyListMessage(timeStatus)} setPageHandler={setPageHandler} />
          </div>
          <div className="right-column right-column--override pfda-main-content-sidebar">
            {userCanCreateChallenge && (
              <ButtonSolidBlue
              data-testid="challenge-create-link"
              as={Link}
              to={`/challenges/create`}
            >
              <PlusIcon height={12} style={{ 'marginRight':'4px' }} /> Create Challenge
            </ButtonSolidBlue>

            )}
            <CollapsibleMenu title="CHALLENGES" options={sideMenuOptions} />
            <hr />
            <div className="pfda-subsection-heading">PREVIOUS CHALLENGES</div>
            <ChallengesYearList setYearHandler={setYearHandler} />
            <hr />
            <div className="pfda-subsection-heading">OTHER CHALLENGES</div>
            <a href='/challenges/app-a-thon-in-a-box' onClick={() => window.location.assign('/challenges/app-a-thon-in-a-box')}>App-a-thon in a Box &rarr;</a>
            <hr />
            <div className="pfda-subsection-heading">PROPOSE A CHALLENGE</div>
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
  setPageHandler: PropTypes.func,
  setYearHandler: PropTypes.func,
  setTimeStatusHandler: PropTypes.func,
  resetFilters: PropTypes.func,
  user: PropTypes.object,
  year: PropTypes.number,
  timeStatus: PropTypes.string,
}

ChallengesListPage.defaultProps = {
  loadChallenges: () => { },
  setPageHandler: () => { },
  setYearHandler: () => { },
  setTimeStatusHandler: () => { },
  resetFilters: () => { },
}

const mapStateToProps = state => ({
  user: contextUserSelector(state),
  year: challengesListYearSelector(state),
  timeStatus: challengesListTimeStatusSelector(state),
})

const mapDispatchToProps = dispatch => ({
  loadChallenges: () => dispatch(fetchChallenges()),
  resetFilters: () => dispatch(challengesListResetFilters()),
  setPageHandler: (page) => {
    dispatch(challengesSetPage(page))
    dispatch(fetchChallenges())
  },
  setYearHandler: (year) => {
    dispatch(challengesListResetFilters())
    dispatch(challengesSetTimeStatus(CHALLENGE_TIME_STATUS.ENDED))
    dispatch(challengesSetYear(year))
    dispatch(fetchChallenges())
  },
  setTimeStatusHandler: (timeStatus) => {
    dispatch(challengesListResetFilters())
    dispatch(challengesSetTimeStatus(timeStatus))
    dispatch(fetchChallenges())
  },
})

export {
  ChallengesListPage,
}

export default connect(mapStateToProps, mapDispatchToProps)(ChallengesListPage)
