import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'

import MemberShape from '../../../../shapes/MemberShape'
import Loader from '../../../Loader'
import MemberCard from '../MemberCard'
import {
  spaceMembersListSelector,
  spaceMembersListIsFetchingSelector,
} from '../../../../../reducers/spaces/members/selectors'
import { spaceDataSelector } from '../../../../../reducers/spaces/space/selectors'
import './style.sass'
import MemberRoleChangeModal from '../MemberRoleChangeModal'
import { showMemberRoleChangeModal } from '../../../../../actions/spaces/members'


const SpaceMembersList = (
  {
    members,
    isFetching,
    spaceId,
    showRoleUpdateModalAction,
    updateRoleData,
  } ) => {

  const updateRole = (updateRoleData) => showRoleUpdateModalAction(spaceId, updateRoleData)

  const classes = classNames({ 'space-members-list': true })

  if (isFetching) {
    return (
      <div className='text-center'>
        <Loader />
      </div>
    )
  }

  if (members.length) {
    return (
      <div className={classes}>
        {members.map((member) =>
          <MemberCard
            updateRole={updateRole}
            member={member}
            key={member.id}
            updateRoleData={updateRoleData}
          />)
        }
        <MemberRoleChangeModal />
      </div>
    )
  }

  return <div className='text-center'>No members found.</div>
}

SpaceMembersList.propTypes = {
  spaceId: PropTypes.number.isRequired,
  members: PropTypes.arrayOf(PropTypes.exact(MemberShape)),
  isFetching: PropTypes.bool,
  checkRoleChangeAction: PropTypes.func,
  showRoleUpdateModalAction: PropTypes.func,
  updateRoleData: PropTypes.object,
}

SpaceMembersList.defaultProps = {
  members: [],
}

const mapStateToProps = state => ({
  members: spaceMembersListSelector(state),
  isFetching: spaceMembersListIsFetchingSelector(state),
  spaceId: spaceDataSelector(state).id,
})

const mapDispatchToProps = dispatch => ({
  showRoleUpdateModalAction: (spaceId, updateRoleData) => { dispatch(showMemberRoleChangeModal(updateRoleData)) },
})

export default connect(mapStateToProps, mapDispatchToProps)(SpaceMembersList)

export {
  SpaceMembersList,
}
