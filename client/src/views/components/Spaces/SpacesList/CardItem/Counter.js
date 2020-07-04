import React from 'react'
import PropTypes from 'prop-types'


import { getSpacesIcon } from '../../../../../helpers/spaces'
import Icon from '../../../Icon'


const Counter = ({ type, counter }) => {
  const icon = getSpacesIcon(type)

  return (
    <div className="spaces-list-card-data__counter">
      <div>
        <Icon icon={icon} />
      </div>
      <div>{counter}</div>
    </div>
  )
}

Counter.propTypes = {
  type: PropTypes.string.isRequired,
  counter: PropTypes.number.isRequired,
}

export default Counter
