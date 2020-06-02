import React, { useState, useCallback, useEffect } from 'react'
import { shallowEqual, useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import Modal from '../../../Modal'
import Button from '../../../Button'
import { SPACE_MEMBERS_ROLES } from '../../../../../constants'
import TextareaField from '../../../FormComponents/TextareaField'
import SelectField from '../../../FormComponents/SelectField'
import { spaceMembersAddModalSelector } from '../../../../../reducers/spaces/members/selectors'
import { hideAddMembersModal } from '../../../../../actions/spaces'


const DEFAULT_VALUE = SPACE_MEMBERS_ROLES[0].value

const Footer = ({ hideHandler, addMembersHandler, disabled }) => (
  <>
    <Button onClick={hideHandler}>Cancel</Button>
    <Button type="primary" onClick={addMembersHandler} disabled={disabled}>
      Add Member/s
    </Button>
  </>
)

const AddMembersModal = ({ addMembersAction }) => {
  const dispatch = useDispatch()
  const modal = useSelector(spaceMembersAddModalSelector, shallowEqual)
  const [invitees, setInvitees] = useState('')
  const [inviteesRole, setInviteesRole] = useState(DEFAULT_VALUE)

  const textAreaLabel = 'Username list'
  const selectLabel = 'Role'
  const disabled = !invitees || !invitees.length

  const changeInvitees = (e) => setInvitees(e.target.value)
  const changeInviteesRole = (e) => setInviteesRole(e.target.value)

  const hideAction = () => dispatch(hideAddMembersModal())
  const addMembersHandler = useCallback(
    () => addMembersAction({ invitees, inviteesRole }),
    [invitees, inviteesRole],
  )

  useEffect(() => {
    if (modal.isOpen) {
      setInvitees('')
      setInviteesRole(DEFAULT_VALUE)
    }
  }, [modal.isOpen])

  return (
    <Modal
      isOpen={modal.isOpen}
      isLoading={modal.isLoading}
      title="Add Member(s)"
      modalFooterContent={<Footer hideHandler={hideAction} addMembersHandler={addMembersHandler} disabled={disabled} />}
      hideModalHandler={hideAction}
    >
      <TextareaField
        name="invitees"
        label={textAreaLabel}
        placeholder="Enter user names or emails, separated by commas..."
        helpText="For example: first_user, second_user, third_user@email.com"
        onChange={changeInvitees}
        value={invitees}
      />

      <SelectField
        name="roles"
        label={selectLabel}
        onChange={changeInviteesRole}
        options={SPACE_MEMBERS_ROLES}
        placeholder={SPACE_MEMBERS_ROLES[0].value}
        helpText="Select a new member(s) role..."
        value={inviteesRole}
      />
    </Modal>
  )
}
export default AddMembersModal

AddMembersModal.propTypes = {
  hideAction: PropTypes.func,
  addMembersAction: PropTypes.func,
  isOpen: PropTypes.bool,
  isLoading: PropTypes.bool,
}

Footer.propTypes = {
  hideHandler: PropTypes.func,
  addMembersHandler: PropTypes.func,
  disabled: PropTypes.bool,
}
