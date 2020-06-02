import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import DefaultLayout from '../../../layouts/DefaultLayout'
import Button from '../../Button'
import Icon from '../../Icon'
import { SPACE_REVIEW } from '../../../../constants'
import {
  spaceDataSelector,
  spaceIsAcceptingSelector,
} from '../../../../reducers/spaces/space/selectors'
import { contextSelector } from '../../../../reducers/context/selectors'
import acceptSpace from '../../../../actions/spaces/acceptSpace'
import SpaceShape from '../../../shapes/SpaceShape'
import './style.sass'


const AcceptButton = ({ isAccepted, isAccepting, onClick, ...rest }) => {
  const buttonLabel = isAccepting ? 'Accepting space...' : 'Accept Space'

  return (
    isAccepted ?
      <div className="activation__accepted">{"You've already accepted this space"}</div> :
      <Button type="success" size="lg" onClick={onClick} {...rest}>{buttonLabel}</Button>
  )
}

AcceptButton.propTypes = {
  isAccepted: PropTypes.bool.isRequired,
  isAccepting: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
}


const acceptedLabel = isAccepted => isAccepted ? 'Accepted' : 'Pending'

const hostLeadLabel = spaceType => `${spaceType === SPACE_REVIEW ? 'Reviewer' : 'Host'} Lead`

const guestLeadLabel = spaceType => `${spaceType === SPACE_REVIEW ? 'Sponsor' : 'Guest'} Lead`


class Activation extends React.Component {
  acceptClickHandler = () => {
    const { space, onAcceptClick } = this.props

    onAcceptClick(space)
  }

  render() {
    const { space, isAccepting, userId } = this.props
    const { name, desc, createdAt, id, type, hostLead, guestLead } = space
    const currentUser = [hostLead, guestLead].filter(user => user && user.id === userId)[0]
    const isAcceptedByUser = currentUser && currentUser.isAccepted
    const hostLabel = hostLeadLabel(type)
    const guestLabel = guestLeadLabel(type)

    return (
      <DefaultLayout>
        <div className="container-fluid pfda-padded-30 space-activation">
          <h1>{name}</h1>
          <h3 className="description">{desc}</h3>

          <div className="space-members row">
            <div className="col-xs-6">
              <div className="space-members_role">{hostLabel}</div>
              {
                hostLead &&
                <>
                  <div className="space-members_name">{hostLead.name}</div>
                  <div className="space-members_status">{acceptedLabel(hostLead.isAccepted)}</div>
                </>
              }
            </div>

            <div className="col-xs-6">
              <div className="space-members_role">{guestLabel}</div>
              {
                guestLead &&
                <>
                  <div className="space-members_name">{guestLead.name}</div>
                  <div className="space-members_status">{acceptedLabel(guestLead.isAccepted)}</div>
                </>
              }
            </div>

            <div className="col-xs-6">
              <div className="space-members_role">Created On</div>
              <div className="space-members_name">{createdAt}</div>
            </div>

            <div className="col-xs-6">
              <div className="space-members_role">Space ID</div>
              <div className="space-members_name">{id}</div>
            </div>
          </div>

          <div className="activation">
            <div className="activation__info">
              <Icon cssClasses="activation__icon" icon="fa-warning" />
              <div className="activation__label">
                <div className="activation__big">
                  This space has not yet been activated.
                </div>
                <div className="activation__small">
                  Both {hostLabel} and {guestLabel} must {'"Accept Space"'} to activate it.
                </div>
              </div>
            </div>
            {
              !!currentUser &&
              <AcceptButton
                disabled={isAccepting}
                isAccepted={isAcceptedByUser}
                isAccepting={isAccepting}
                onClick={this.acceptClickHandler}
              />
            }
          </div>
        </div>
      </DefaultLayout>
    )
  }
}

Activation.propTypes = {
  space: PropTypes.shape(SpaceShape).isRequired,
  isAccepting: PropTypes.bool,
  onAcceptClick: PropTypes.func.isRequired,
  userId: PropTypes.number,
}

Activation.defaultProps = {
  isAccepting: false,
}

const mapStateToProps = state => ({
  space: spaceDataSelector(state),
  userId: contextSelector(state).user.id,
  isAccepting: spaceIsAcceptingSelector(state),
})

const mapDispatchToProps = dispatch => ({
  onAcceptClick: space => dispatch(acceptSpace(space)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Activation)

export { Activation }
