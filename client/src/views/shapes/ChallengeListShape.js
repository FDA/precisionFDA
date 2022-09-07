import PropTypes from 'prop-types'

import { CHALLENGE_STATUS } from '../../constants'


// N.B. Unused because the list view of challenges is simply returning ChallengeShape
//      rather than a subset of attributes adapted for the list
//      There is value in considering this approach mainly removing the 'meta' attribute
//      would cut down on payload size a lot
const ChallengeListItemShape = {
  id: PropTypes.number,
  name: PropTypes.string,
  description: PropTypes.string,
  startAt: PropTypes.Date,
  endAt: PropTypes.Date,
  createdAt: PropTypes.Date,
  updatedAt: PropTypes.Date,
  status: PropTypes.exact(CHALLENGE_STATUS),
  cardImageUrl: PropTypes.string,
}

const  mapToChallengeListItem = (data) => {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    startAt: new Date(data.start_at),
    endAt: new Date(data.end_at),
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    status: data.status,
    cardImageUrl: data.card_image_url,
  }
}

export default ChallengeListItemShape

export {
  ChallengeListItemShape,
  mapToChallengeListItem,
}
