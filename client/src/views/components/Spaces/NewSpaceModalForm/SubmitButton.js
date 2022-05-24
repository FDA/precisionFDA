import React from 'react'
import PropTypes from 'prop-types'

import Button from '../../../components/Button'
import { NEW_SPACE_PAGE_ACTIONS } from '../../../../constants'


const SubmitButton = ({ action, submitClickHandler, disabled, isSubmitting }) => {
  switch (action) {
    case NEW_SPACE_PAGE_ACTIONS.EDIT:
      return (
        <Button type="primary" onClick={submitClickHandler} disabled={disabled}>
          {isSubmitting ? 'Editing...' : 'Edit Space'}
        </Button>
      )
    default:
      return (
        <Button type="primary" onClick={submitClickHandler} disabled={disabled}>
          {isSubmitting ? 'Creating...' : 'Create Space'}
        </Button>
      )
  }
}

export default SubmitButton

SubmitButton.propTypes = {
  action: PropTypes.string,
  submitClickHandler: PropTypes.func,
  disabled: PropTypes.bool,
  isSubmitting: PropTypes.bool,
}
