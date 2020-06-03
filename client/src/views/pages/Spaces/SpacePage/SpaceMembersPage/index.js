import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import classNames from 'classnames/bind'
import capitalize from 'capitalize'
import { isEmpty } from 'ramda'

import SpaceShape from '../../../../shapes/SpaceShape'
import { spaceDataSelector } from '../../../../../reducers/spaces/space/selectors'
import {
  spaceMembersAddErrorsSelector,
} from '../../../../../reducers/spaces/members/selectors'
import SpaceLayout from '../../../../layouts/SpaceLayout'
import {
  fetchMembers,
  showAddMembersModal,
} from '../../../../../actions/spaces'
import { inviteMembers } from '../../../../../actions/spaces/members'
import SpaceMembersList from '../../../../components/Space/Members/SpaceMembersList'
import Button from '../../../../components/Button'
import Icon from '../../../../components/Icon'
import { getSpacePageTitle, getSpaceMembersSides } from '../../../../../helpers/spaces'
import { getQueryParam } from '../../../../../utils'
import AddMembersModal from '../../../../components/Space/Members/AddMembersModal'


const ShowFilters = ({ spaceId, spaceSides, classesSides }) => (
  <>
    <Link to={ { pathname: `/spaces/${spaceId}/members`, search: `?side=${spaceSides.all}` } }
          className={classesSides.all}>
      {`${capitalize(spaceSides.all)}`}
    </Link>
    <Link to={ { pathname: `/spaces/${spaceId}/members`, search: `?side=${spaceSides.host}` } }
          className={classesSides.host}>
      {`${capitalize(spaceSides.host)}`}
    </Link>
    <Link to={ { pathname: `/spaces/${spaceId}/members`, search: `?side=${spaceSides.guest}` } }
          className={classesSides.guest}>
      {`${capitalize(spaceSides.guest)}`}
    </Link>
  </>
)

class SpaceMembersPage extends Component {
  getQuerySide = () => {
    const { location } = this.props
    return getQueryParam(location.search, 'side')
  }

  loadSpaceMembers = () => {
    const { loadMembers, spaceId } = this.props
    const side = this.getQuerySide()
    loadMembers(spaceId, side)
  }

  addMembersAction = (fieldsValues) => {
    const { addMembers, spaceId } = this.props
    const side = this.getQuerySide()
    addMembers(spaceId, side, fieldsValues)
  }

  componentDidMount() {
    if (!isEmpty(this.props.space)) {
      this.loadSpaceMembers()
    }
  }

  componentDidUpdate(prevProps) {
    const { search } = this.props.location
    if (search !== prevProps.location.search || prevProps.space !== this.props.space) {
      this.loadSpaceMembers()
    }
  }

  render() {
    const { spaceId, space, showAddMembersModal } = this.props
    const title = getSpacePageTitle('Members', space.isPrivate)

    const spaceSides = getSpaceMembersSides(space.type)
    const querySide = this.getQuerySide()
    const classesSidesAll = classNames({
      'btn btn-primary': (spaceSides.all === querySide) || (querySide === null),
      'btn btn-default': (spaceSides.all !== querySide && querySide !== null),
    })
    const classesSidesHost = classNames({
      'btn btn-primary': (spaceSides.host === querySide),
      'btn btn-default': (spaceSides.host !== querySide),
    })
    const classesSidesGuest = classNames({
      'btn btn-primary': (spaceSides.guest === querySide),
      'btn btn-default': (spaceSides.guest !== querySide),
    })
    const classesSides = {
      all: classesSidesAll,
      host: classesSidesHost,
      guest: classesSidesGuest,
    }

    return (
      <SpaceLayout spaceId={spaceId} space={space}>
        <div className="space-page-layout__header-row">
          <h2 className="space-page-layout__sub-title">{title}</h2>
          <div className="space-page-layout__actions">
            {space.updatable && (
              <Button type="primary" onClick={showAddMembersModal}>
                <span>
                  <Icon icon="fa-plus" />&nbsp;
                  Add Members
                </span>
              </Button>
            )}
          </div>
        </div>

        <div className="pfda-padded-t20">
          {(!space.isPrivate) && (
            <ShowFilters
              spaceId={spaceId}
              spaceSides={spaceSides}
              classesSides={classesSides}
            />
          )}
          <SpaceMembersList />
        </div>
        <AddMembersModal addMembersAction={this.addMembersAction} />
      </SpaceLayout>
    )
  }
}

SpaceMembersPage.propTypes = {
  spaceId: PropTypes.string,
  space: PropTypes.shape(SpaceShape),
  loadMembers: PropTypes.func,
  location: PropTypes.object,
  showAddMembersModal: PropTypes.func,
  addMembers: PropTypes.func,
  side: PropTypes.string,
  errors: PropTypes.string,
}

SpaceMembersPage.defaultProps = {
  loadMembers: () => {},
  showAddMembersModal: () => {},
  addMembers: () => {},
}

const mapStateToProps = (state) => ({
  space: spaceDataSelector(state),
  errors: spaceMembersAddErrorsSelector(state),
})

const mapDispatchToProps = dispatch => ({
  loadMembers: (spaceId, side) => dispatch(fetchMembers(spaceId, side)),
  showAddMembersModal: () => dispatch(showAddMembersModal()),
  addMembers: (spaceId, side, fieldsValues) => {
    dispatch(inviteMembers(spaceId, fieldsValues)).then((statusIsOk) => {
      if (statusIsOk) {
        dispatch(fetchMembers(spaceId, side))
      }
    })
  },
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SpaceMembersPage))

export {
  SpaceMembersPage,
}

ShowFilters.propTypes = {
  spaceId: PropTypes.string,
  classesSides: PropTypes.object,
  spaceSides: PropTypes.object,
}
