import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Alert from './Alert'
import AlertShape from '../../shapes/AlertShape'
import { hideAlert } from '../../../actions/alertNotifications'
import { alertMessagesSelector } from '../../../reducers/alertNotifications/selectors'
import './style.sass'


const AlertNotifications = ({ messages, hideAlert }) => {
  return (
    <div className="alert-notifications">
      {messages.map((alert, index) => <Alert alert={alert} hideAlertHandler={hideAlert} key={index} />)}
    </div>
  )
}

AlertNotifications.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.exact(AlertShape)),
  hideAlert: PropTypes.func,
}

AlertNotifications.defaultProps = {
  messages: [],
  hideAlert: () => {},
}

const mapStateToProps = state => ({
  messages: alertMessagesSelector(state),
})

const mapDispatchToProps = dispatch => ({
  hideAlert: (id) => dispatch(hideAlert(id)),
})

export default connect(mapStateToProps, mapDispatchToProps)(AlertNotifications)

export {
  AlertNotifications,
}
