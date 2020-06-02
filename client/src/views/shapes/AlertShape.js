import uniqid from 'uniqid'
import PropTypes from 'prop-types'

import { ALERT_TYPES, ALERT_STYLES } from '../../constants'


const AlertShape = {
  id: PropTypes.string,
  type: PropTypes.oneOf(ALERT_TYPES),
  style: PropTypes.oneOf(ALERT_STYLES),
  message: PropTypes.string,
  duration: PropTypes.number,
}

const mapToAlertNotification = ({ id, message, style = 'danger', type, duration = 5000 }) => ({
  id: id || uniqid('alert-'),
  message,
  style,
  type,
  duration,
})

export default AlertShape

export {
  AlertShape,
  mapToAlertNotification,
}
