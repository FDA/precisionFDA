import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'
import { format } from 'date-fns'

import history from '../../../../utils/history'
import ChallengeShape from '../../../shapes/ChallengeShape'
import PaginationShape from '../../../shapes/PaginationShape'
import Pagination from '../../TableComponents/Pagination'
import Loader from '../../Loader'
import Button from '../../Button'
import ChallengeTimeRemaining from '../ChallengeTimeRemaining'
import {
  fetchChallenges,
  challengesSetPage,
} from '../../../../actions/challenges'
import {
  challengesListSelector,
  challengesListIsFetchingSelector,
  challengesListPaginationSelector,
} from '../../../../reducers/challenges/list/selectors'
import { contextUserSelector } from '../../../../reducers/context/selectors'
import { CHALLENGE_STATUS, CHALLENGE_TIME_STATUS } from '../../../../constants'
import './style.sass'


const ChallengesList = ({ challenges, isFetching, pagination, setPageHandler, user }) => {
  const classes = classNames(['challenges-list'])

  if (isFetching) {
    return (
      <div className='text-center'>
        <Loader />
      </div>
    )
  }

  if (challenges.length) {
    // Do some property injection to determine the first of different sections
    //
    //   if challenge.isFirstItemInSection = true , insers a header before the list item to
    //   denote the section header, using the challenge.sectionHeading attribute
    //
    // TODO: Consider using an enum for challenge.hasStarted and challenge.hasEnded,
    //       would make the code neater
    let foundFirstUpcomingChallenge = false
    let foundFirstCurrentChallenge = false
    let foundFirstClosedChallenge = false
    challenges.map((challenge) => {
      if (!foundFirstUpcomingChallenge && challenge.timeStatus == CHALLENGE_TIME_STATUS.UPCOMING) {
        challenge.isFirstItemInSection = true
        challenge.sectionHeading = 'Upcoming Challenges'
        foundFirstUpcomingChallenge = true
      }
      else if (!foundFirstCurrentChallenge && challenge.timeStatus == CHALLENGE_TIME_STATUS.CURRENT) {
        challenge.isFirstItemInSection = true
        challenge.sectionHeading = 'Current Challenges'
        foundFirstCurrentChallenge = true
      }
      else if (!foundFirstClosedChallenge && challenge.timeStatus == CHALLENGE_TIME_STATUS.ENDED) {
        challenge.isFirstItemInSection = true
        challenge.sectionHeading = 'Previous Challenges'
        foundFirstClosedChallenge = true
      }
      else {
        challenge.isFirstItemInSection = false
      }
    })

    // The following reorders the response to put all current challenges in front
    // as specified by the mock ups
    //
    const currentChallenges = challenges.filter((challenge) => {
      return challenge.timeStatus == CHALLENGE_TIME_STATUS.CURRENT
    })
    challenges = [...currentChallenges, ...challenges.filter(x => !currentChallenges.includes(x))]

    const handleItemDetails = (id) => {
      history.push(`/new_challenges/${id}`)
    }

    const handleJoinChallenge = (id) => {
      window.location.assign(`/challenges/${id}/join`)
    }

    const isLoggedIn = user && Object.keys(user).length > 0
    const canUserJoin = (challenge) => isLoggedIn && !challenge.isFollowed && challenge.timeStatus == CHALLENGE_TIME_STATUS.CURRENT && challenge.status == CHALLENGE_STATUS.OPEN

    return (
      <div>
        <ul className={classes}>
          {challenges.map((challenge) => <ChallengesListItem key={challenge.id} challenge={challenge} handleItemDetails={handleItemDetails} handleJoinChallenge={handleJoinChallenge} userCanJoin={canUserJoin(challenge)} />, this)}
        </ul>
        <Pagination data={pagination} setPageHandler={setPageHandler} />
      </div>
    )
  }

  return <div className='text-center'>No challenges found.</div>
}

ChallengesList.propTypes = {
  challenges: PropTypes.arrayOf(PropTypes.shape(ChallengeShape)),
  isFetching: PropTypes.bool,
  pagination: PropTypes.exact(PaginationShape),
  setPageHandler: PropTypes.func,
  user: PropTypes.object,
}

ChallengesList.defaultProps = {
  challenges: [],
  isFetching: false,
}

const mapStateToProps = state => ({
  challenges: challengesListSelector(state),
  isFetching: challengesListIsFetchingSelector(state),
  pagination: challengesListPaginationSelector(state),
  user: contextUserSelector(state),
})

const mapDispatchToProps = dispatch => ({
  openChallengeDetails: (id) => history.push(`/challenges/${id}`),
  setPageHandler: (page) => {
    dispatch(challengesSetPage(page))
    dispatch(fetchChallenges())
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(ChallengesList)



// TODO - Consider splitting ChallengesListItem to separate file
//
class ChallengesListItem extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const challenge = this.props.challenge
    const userCanJoin = this.props.userCanJoin
    const handleItemDetails = this.props.handleItemDetails
    const handleJoinChallenge = this.props.handleJoinChallenge

    const getChallengeStatusClasses = (challenge) => {
      return {
        'upcoming': challenge.timeStatus == CHALLENGE_TIME_STATUS.UPCOMING,
        'current': challenge.timeStatus == CHALLENGE_TIME_STATUS.CURRENT,
        'ended': challenge.timeStatus == CHALLENGE_TIME_STATUS.ENDED,
        }
    }

    const classes = classNames('challenges-list-item', getChallengeStatusClasses(challenge))

    const userCanEdit = challenge.canEdit

    return (
      <li className={classes}>
        <div className='challenge-image'>
          {challenge.isFirstItemInSection ? <div className={classNames('challenges-list-section-header', getChallengeStatusClasses(challenge))}><hr /></div> : ''}
          <img src={challenge.cardImageUrl} onClick={() => handleItemDetails(challenge.id)} />
        </div>
        <div className='challenge-content'>
          {challenge.isFirstItemInSection ? <div className={classNames('challenges-list-section-header', getChallengeStatusClasses(challenge))}><span className='label'>{challenge.sectionHeading}</span></div> : ''}
          <h1 onClick={() => handleItemDetails(challenge.id)}>{challenge.name}</h1>
          <div className='date-area'>
            <span className='challenge-date-label'>Starts</span>
            <span className='challenge-date'>{format(challenge.startAt, 'MM/dd/yyyy')}</span>
            <span style={{ 'marginRight': '8px' }}>&rarr;</span>
            <span className='challenge-date-label'>Ends</span>
            <span className='challenge-date'>{format(challenge.endAt, 'MM/dd/yyyy')} </span>
            <div className='challenge-date-remaining'><ChallengeTimeRemaining challenge={challenge} /></div>
          </div>
          <p>{challenge.description}</p>
          {userCanJoin && (
            <Button onClick={() => handleJoinChallenge(challenge.id)}>Join Challenge</Button>
          )}
          <Button onClick={() => handleItemDetails(challenge.id)}>View Details &rarr;</Button>
          {userCanEdit && (
          <div className="btn-group pull-right">
            <a className="btn btn-default" href={`/challenges/${challenge.id}/edit`}><span className="fa fa-cog fa-fw"></span> Settings</a>
            <a className="btn btn-default" href={`/challenges/${challenge.id}/editor`} data-no-turbolink="true"><span className="fa fa-file-code-o fa-fw"></span> Edit Page</a>
          </div>
          )}
        </div>
      </li>
    )  
  }
}

ChallengesListItem.propTypes = {
  challenge: PropTypes.shape(ChallengeShape),
  userCanJoin: PropTypes.bool,
  handleJoinChallenge: PropTypes.func,
  handleItemDetails: PropTypes.func,
}


export {
  ChallengesList,
  ChallengesListItem,
}
