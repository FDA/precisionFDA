import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { shallowEqual, useSelector, useDispatch } from 'react-redux'

import Modal from '../../../Modal'
import Button from '../../../Button'
import { spaceDataSelector } from '../../../../../reducers/spaces/space/selectors'
import {
  spaceMemberRoleChangeModalSelector,
  spaceMembersListSelector,
} from '../../../../../reducers/spaces/members/selectors'
import {
  checkMemberRoleChange,
  fetchMembers,
  hideMemberRoleChangeModal,
  updateRole,
} from '../../../../../actions/spaces/members'
import MemberShape from '../../../../shapes/MemberShape'
import { getQueryParam } from '../../../../../utils'


const Footer = ({ hideAction, roleUpdateAction }) => (
  <>
    <Button onClick={hideAction}>Cancel</Button>
    <Button type="warning" onClick={roleUpdateAction}>Update Role</Button>
  </>
)

const MessagePrompt = ({ toRole, memberTitle }) => (
  <>
    Are you sure you want to change a role to &apos;{toRole}&apos; for the member {memberTitle}?
  </>
)

const MemberRoleChangeModal = ({ members }) => {
  const dispatch = useDispatch()
  const hideAction = () => dispatch(hideMemberRoleChangeModal())

  const modal = useSelector(spaceMemberRoleChangeModalSelector, shallowEqual)
  const updateRoleData = modal.updateRoleData
  const spaceId = useSelector(spaceDataSelector).id

  const getQuerySide = () => {
    const location = useLocation()
    return getQueryParam(location.search, 'side')
  }
  const side = getQuerySide()

  const roleUpdateAction = () => {
    dispatch(updateRole(spaceId, updateRoleData))
    dispatch(checkMemberRoleChange(spaceId))
    dispatch(fetchMembers(spaceId, side))
  }

  const toRole = updateRoleData.toRole
  const memberId = updateRoleData.memberId

  const memberTitle = (members, memberId) => {
    const member = members.find(o => o.id === memberId)
    if ( member !== undefined && member !== null) {
      return member.title
    }
  }

  return (
    <Modal
      isOpen={modal.isOpen}
      isLoading={modal.isLoading}
      title="Change Member Role"
      modalFooterContent={<Footer hideAction={hideAction} roleUpdateAction={roleUpdateAction} />}
      hideModalHandler={hideAction}
    >
      <MessagePrompt
        toRole={toRole}
        memberTitle={memberTitle(members, memberId)}
      />
    </Modal>
  )
}

MemberRoleChangeModal.propTypes = {
  members: PropTypes.arrayOf(PropTypes.exact(MemberShape)),
}

const mapStateToProps = state => ({
  members: spaceMembersListSelector(state),
})

export default connect(mapStateToProps)(MemberRoleChangeModal)

Footer.propTypes = {
  hideAction: PropTypes.func,
  roleUpdateAction: PropTypes.func,
}

MessagePrompt.propTypes = {
  toRole: PropTypes.string,
  memberTitle: PropTypes.string,
}
