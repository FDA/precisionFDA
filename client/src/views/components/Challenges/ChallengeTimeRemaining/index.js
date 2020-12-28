import React from 'react'
import PropTypes from 'prop-types'
import { formatDistance } from 'date-fns'

import ChallengeShape from '../../../shapes/ChallengeShape'
import { CHALLENGE_TIME_STATUS } from '../../../../constants'


const ChallengeTimeRemaining = ({ challenge }) => {
  let timeRemainingLabel = 'Ended'
  switch (challenge.timeStatus) {
    case CHALLENGE_TIME_STATUS.UPCOMING:
      timeRemainingLabel = 'Starting in about ' + formatDistance(new Date(), challenge.startAt).replace('about ', '')
      break
    case CHALLENGE_TIME_STATUS.CURRENT:
      timeRemainingLabel = 'About ' + formatDistance(new Date(), challenge.endAt).replace('about ', '') + ' remaining'
      break
  }
  return (
    <span>{timeRemainingLabel}</span>
  )
}

ChallengeTimeRemaining.propTypes = {
  challenge: PropTypes.shape(ChallengeShape),
}

export {
  ChallengeTimeRemaining,
}

export default ChallengeTimeRemaining
