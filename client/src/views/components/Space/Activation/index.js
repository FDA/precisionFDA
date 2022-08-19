import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import acceptSpace from '../../../../actions/spaces/acceptSpace'
import { SPACE_ADMINISTRATOR, SPACE_GOVERNMENT, SPACE_GROUPS, SPACE_REVIEW, SPACE_VERIFICATION } from '../../../../constants'
import { getGuestLeadLabel, getHostLeadLabel } from '../../../../helpers/spaces'
import { contextSelector } from '../../../../reducers/context/selectors'
import { spaceDataSelector, spaceIsAcceptingSelector } from '../../../../reducers/spaces/space/selectors'
import Button from '../../Button'
import Icon from '../../Icon'
import './style.sass'


const AcceptButton = ({ isAccepted, isAccepting, onClick, ...rest }) => {
  const buttonLabel = isAccepting ? 'Accepting space...' : 'Accept Space'

  return isAccepted ? (
    <div className="activation__accepted">{"You've already accepted this space"}</div>
  ) : (
    <Button type="success" size="lg" onClick={onClick} {...rest}>
      {buttonLabel}
    </Button>
  )
}

AcceptButton.propTypes = {
  isAccepted: PropTypes.bool.isRequired,
  isAccepting: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
}

const acceptedLabel = isAccepted => (isAccepted ? 'Accepted' : 'Pending')

const hostLeadLabel = spaceType =>
  `${
    spaceType === SPACE_REVIEW
      ? 'Reviewer Lead'
      : getHostLeadLabel(spaceType, [SPACE_VERIFICATION, SPACE_GROUPS, SPACE_GOVERNMENT], [SPACE_ADMINISTRATOR])
  }`

const guestLeadLabel = spaceType => {
  if ([SPACE_REVIEW, SPACE_GROUPS, SPACE_GOVERNMENT, SPACE_ADMINISTRATOR].includes(spaceType)) {
    return `${
      spaceType === SPACE_REVIEW
        ? 'Sponsor Lead'
        : getGuestLeadLabel(spaceType, [SPACE_VERIFICATION, SPACE_GROUPS, SPACE_GOVERNMENT], [SPACE_ADMINISTRATOR])
    }`
  } else {
    return ''
  }
}

class Activation extends React.Component {
  acceptClickHandler = () => {
    const { space, onAcceptClick } = this.props

    onAcceptClick(space)
  }

  render() {
    const { space, isAccepting, userId } = this.props
    const { name, description, created_at, id, type, host_lead, guest_lead } = space
    const currentUser = [host_lead, guest_lead].filter(user => user && user.id === userId)[0]
    const isAcceptedByUser = currentUser && currentUser.isAccepted
    const hostLabel = hostLeadLabel(type)
    const guestLabel = guestLeadLabel(type)

    const activationMessage = guest_lead
      ? `Both ${hostLabel} and ${guestLabel} must "Accept Space" to activate it.`
      : `${hostLabel} must "Accept Space" to activate it.`

    return (
      <>
        <div className="container-fluid pfda-padded-30 space-activation">
          <h1>{name}</h1>
          <h3 className="description">{description}</h3>

          <div className="space-members row">
            <div className="col-xs-6">
              <div className="space-members_role">{hostLabel}</div>
              {host_lead && (
                <>
                  <div className="space-members_name">{host_lead.name}</div>
                  <div className="space-members_status">{acceptedLabel(host_lead.isAccepted)}</div>
                </>
              )}
            </div>

            <div className="col-xs-6">
              <div className="space-members_role">{guestLabel}</div>
              {guest_lead && (
                <>
                  <div className="space-members_name">{guest_lead.name}</div>
                  <div className="space-members_status">{acceptedLabel(guest_lead.isAccepted)}</div>
                </>
              )}
            </div>

            <div className="col-xs-6">
              <div className="space-members_role">Created On</div>
              <div className="space-members_name">{created_at}</div>
            </div>

            <div className="col-xs-6">
              <div className="space-members_role">Space ID</div>
              <div className="space-members_name">{id}</div>
            </div>
          </div>

          <div className="activation accept_space">
            <div className="activation__info">
              <Icon cssClasses="activation__icon" icon="fa-warning" />
              <div className="activation__label">
                <div className="activation__big">This space has not yet been activated.</div>
                <div className="activation__small">{activationMessage}</div>
              </div>
            </div>
            {!!currentUser && (
              <AcceptButton
                disabled={isAccepting}
                isAccepted={isAcceptedByUser}
                isAccepting={isAccepting}
                onClick={this.acceptClickHandler}
              />
            )}
          </div>
        </div>
      </>
    )
  }
}

Activation.propTypes = {
  space: PropTypes.object,
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
