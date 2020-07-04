import React from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'

import DefaultLayout from '../../../layouts/DefaultLayout'
import NewSpaceForm from '../../../components/Spaces/NewSpaceForm'
import Button from '../../../components/Button'
import { NEW_SPACE_PAGE_ACTIONS } from '../../../../constants'


class NewSpacePage extends React.Component {
  redirectToSpaces = () => {
    this.props.history.goBack()
  }

  render() {
    const { action, history } = this.props
    const title = (action === NEW_SPACE_PAGE_ACTIONS.EDIT) ? 'Edit space' : 'Create a new space'
    return (
      <DefaultLayout>
        <div className="container">
          <div className="row">
            <div className="pull-left">
              <h1>{title}</h1>
            </div>
            <div className="pull-right pfda-mr-t20">
              <Button onClick={history.goBack} size="lg" type="primary">Back</Button>
            </div>
          </div>
          <NewSpaceForm action={action} onCancelClick={this.redirectToSpaces} />
        </div>
      </DefaultLayout>
    )
  }
}

NewSpacePage.propTypes = {
  history: PropTypes.object,
  action: PropTypes.string,
}

export default withRouter(NewSpacePage)
