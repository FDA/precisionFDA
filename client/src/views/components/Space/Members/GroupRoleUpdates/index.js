import React from 'react'
import PropTypes from 'prop-types'
import capitalize from 'capitalize'
import { connect, useSelector } from 'react-redux'

import './style.sass'
import Button from '../../../Button'
import Icon from '../../../Icon'
import { getSpacesIcon } from '../../../../../helpers/spaces'
import './style.sass'
import { spaceDataSelector } from '../../../../../reducers/spaces/space/selectors'
import { SPACE_STATUS_ACTIVE } from '../../../../../constants'


const RoleUpdateButton = ({ changeTo, updateRoleHandler, memberId, disabled }) => {
  const onClickHandler = () => updateRoleHandler(changeTo, memberId)

  const buttonTitle = (changeTo) => {
    const toRoleCapitalized = capitalize(changeTo)
    if ( changeTo !== undefined && changeTo !== null && (changeTo === 'disable' || changeTo === 'enable')) {
      return toRoleCapitalized
    } else {
      return `To ${toRoleCapitalized}`
    }
  }

  return (
    <>
      <Button type="default" size="xs" onClick={onClickHandler} disabled={disabled}>
        <Icon icon={getSpacesIcon(changeTo)} fw/>
        <span>{buttonTitle(changeTo)}</span>
      </Button>
    </>
  )
}

const GroupRoleUpdates = ({ member, updateRole }) => {
  const updateRoleHandler = (toRole, memberId ) => updateRole({ toRole, memberId })
  const space = useSelector(spaceDataSelector)
  const isDisabled = space.status !== SPACE_STATUS_ACTIVE

  return (
    <>
      {
        member.availableRoles.map(role => (
          <RoleUpdateButton
            key={role}
            disabled={isDisabled}
            changeTo={role}
            memberId={member.id}
            updateRoleHandler={updateRoleHandler}
          />
        ))
      }
    </>
  )
}

const mapStateToProps = () => ({})

export default connect(mapStateToProps)(GroupRoleUpdates)

GroupRoleUpdates.propTypes = {
  updateRole: PropTypes.func,
  toRoleCheck: PropTypes.func,
  member: PropTypes.object,
}

RoleUpdateButton.propTypes = {
  changeTo: PropTypes.string,
  updateRoleHandler: PropTypes.func,
  memberId: PropTypes.number,
  disabled: PropTypes.bool,
}
