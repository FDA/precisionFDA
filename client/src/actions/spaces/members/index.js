import { createAction } from '../../../utils/redux'
import {
  SPACE_MEMBERS_SHOW_ADD_MEMBERS_MODAL,
  SPACE_MEMBERS_HIDE_ADD_MEMBERS_MODAL,
  SPACE_MEMBERS_SHOW_ROLE_CHANGE_MODAL,
  SPACE_MEMBERS_HIDE_ROLE_CHANGE_MODAL,
} from '../types'
import fetchMembers from './fetchMembers'
import inviteMembers from './inviteMembers'
import updateRole from './memberRoleUpdate'


const showAddMembersModal = () => createAction(SPACE_MEMBERS_SHOW_ADD_MEMBERS_MODAL)
const hideAddMembersModal = () => createAction(SPACE_MEMBERS_HIDE_ADD_MEMBERS_MODAL)

const showMemberRoleChangeModal = (updateRoleData) =>
  createAction(SPACE_MEMBERS_SHOW_ROLE_CHANGE_MODAL, { updateRoleData })
const hideMemberRoleChangeModal = () => createAction(SPACE_MEMBERS_HIDE_ROLE_CHANGE_MODAL)

export {
  fetchMembers,
  inviteMembers,
  showAddMembersModal,
  hideAddMembersModal,
  showMemberRoleChangeModal,
  hideMemberRoleChangeModal,
  updateRole,
}
