import React from 'react'
import PropTypes from 'prop-types'
import { shallowEqual, useSelector, useDispatch } from 'react-redux'

import Modal from '../../../Modal'
import Button from '../../../Button'
import { spaceDataSelector } from '../../../../../reducers/spaces/space/selectors'
import {
  spaceMemberRoleChangeModalSelector,
  spaceMembersListSelector,
} from '../../../../../reducers/spaces/members/selectors'
import {
  hideMemberRoleChangeModal,
  updateRole,
} from '../../../../../actions/spaces/members'


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

const MemberRoleChangeModal = () => {
  const dispatch = useDispatch()
  const members = useSelector(spaceMembersListSelector)
  const hideAction = () => dispatch(hideMemberRoleChangeModal())

  const modal = useSelector(spaceMemberRoleChangeModalSelector, shallowEqual)
  const updateRoleData = modal.updateRoleData
  const spaceId = useSelector(spaceDataSelector).id

  const roleUpdateAction = () => {
    dispatch(updateRole(spaceId, updateRoleData))
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

export default MemberRoleChangeModal

Footer.propTypes = {
  hideAction: PropTypes.func,
  roleUpdateAction: PropTypes.func,
}

MessagePrompt.propTypes = {
  toRole: PropTypes.string,
  memberTitle: PropTypes.string,
}
