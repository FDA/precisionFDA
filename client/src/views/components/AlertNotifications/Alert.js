import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import AlertShape from '../../shapes/AlertShape'
import { ALERT_ABOVE_ALL } from '../../../constants'


const Alert = ({ alert, hideAlertHandler }) => {
  const timer = useRef(null)
  useEffect(() => {
    timer.current = setTimeout(() => hideAlertHandler(alert.id), alert.duration)
    return () => clearTimeout(timer.current)
  })

  const classes = classNames({
    'alert-notifications__message': true,
    'alert-notifications__message--above-all': alert.type === ALERT_ABOVE_ALL,
  }, `text-center alert alert-${alert.style}`)

  const onClick = () => {
    hideAlertHandler(alert.id)
    clearTimeout(timer.current)
  }

  return (
    <div className={classes} onClick={onClick}>
      {alert.message}
    </div>
  )
}

Alert.defaultProps = {
  hideAlertHandler: () => {},
}

Alert.propTypes = {
  alert: PropTypes.exact(AlertShape),
  hideAlertHandler: PropTypes.func,
}

export default Alert
