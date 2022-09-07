import PropTypes from 'prop-types'

import { CHALLENGE_TIME_STATUS } from '../../constants'
import { convertDateToUserTime } from '../../utils/datetime'


const ChallengeShape = {
  id: PropTypes.number,
  name: PropTypes.string,
  appOwnerId: PropTypes.number,
  appId: PropTypes.number,
  description: PropTypes.string,
  meta: PropTypes.object,
  startAt: PropTypes.object,
  endAt: PropTypes.object,
  createdAt: PropTypes.object,
  updatedAt: PropTypes.object,
  status: PropTypes.string,
  automated: PropTypes.bool,
  cardImageUrl: PropTypes.string,
  cardImageId: PropTypes.string,
  specifiedOrder: PropTypes.number,
  spaceId: PropTypes.number,
  preRegistrationUrl: PropTypes.string,
  isFollowed: PropTypes.bool, // True if user has joined the challenge
  isSpaceMember: PropTypes.bool, // True is user is member of challenge's space
  canEdit: PropTypes.bool,
  links: PropTypes.object,
}

const computeChallengeTimeStatus = (challenge) => {
  const timeNow = (new Date()).getTime()
  challenge.hasStarted = timeNow > challenge.startAt.getTime()
  challenge.hasEnded = timeNow > challenge.endAt.getTime()
  if (!challenge.hasStarted) {
    challenge.timeStatus = CHALLENGE_TIME_STATUS.UPCOMING
  }
  else if (!challenge.hasEnded) {
    challenge.timeStatus = CHALLENGE_TIME_STATUS.CURRENT
  }
  else {
    challenge.timeStatus = CHALLENGE_TIME_STATUS.ENDED
  }
}

const mapToChallenge = (data) => {
  const challenge = {
    id: data.id,
    name: data.name,
    description: data.description,
    meta: data.meta,
    startAt: convertDateToUserTime(data.start_at),
    endAt: convertDateToUserTime(data.end_at),
    createdAt: convertDateToUserTime(data.created_at),
    updatedAt: convertDateToUserTime(data.updated_at),
    status: data.status,
    cardImageUrl: data.card_image_url,
    cardImageId: data.card_image_id,
    preRegistrationUrl: data.pre_registration_url,
    isFollowed: data.is_followed,
    isSpaceMember: data.is_space_member,
    canEdit: data.can_edit,
    links: data.links,
  }
  computeChallengeTimeStatus(challenge)
  return challenge
}

export default ChallengeShape

export {
  ChallengeShape,
  mapToChallenge,
}
