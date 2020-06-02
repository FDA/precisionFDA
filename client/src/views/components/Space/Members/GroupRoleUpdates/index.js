import React from 'react'
import PropTypes from 'prop-types'
import capitalize from 'capitalize'
import { connect, useSelector } from 'react-redux'

import './style.sass'
import Button from '../../../Button'
import Icon from '../../../Icon'
import { getSpacesIcon } from '../../../../../helpers/spaces'
import {
  spaceMembersCheckRoleSelector,
} from '../../../../../reducers/spaces/members/selectors'
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

const GroupRoleUpdates = ({ memberId, updateRole, toRoleCheck }) => {
  const updateRoleHandler = (toRole, memberId ) => updateRole({ toRole, memberId })
  const changeRoleChecks = useSelector(spaceMembersCheckRoleSelector)
  const space = useSelector(spaceDataSelector)
  const isDisabled = space.status !== SPACE_STATUS_ACTIVE

  return (
    <>
      {toRoleCheck(changeRoleChecks, memberId, 'disable') && (
        <RoleUpdateButton
          disabled={isDisabled}
          changeTo={'disable'}
          memberId={memberId}
          updateRoleHandler={updateRoleHandler}
        />
      )}

      {toRoleCheck(changeRoleChecks, memberId, 'enable') && (
        <RoleUpdateButton
          disabled={isDisabled}
          changeTo={'enable'}
          memberId={memberId}
          updateRoleHandler={updateRoleHandler}
        />
      )}

      {toRoleCheck(changeRoleChecks, memberId, 'lead') && (
        <RoleUpdateButton
          disabled={isDisabled}
          changeTo={'lead'}
          memberId={memberId}
          updateRoleHandler={updateRoleHandler}
        />
      )}

      {toRoleCheck(changeRoleChecks, memberId, 'admin') && (
        <RoleUpdateButton
          disabled={isDisabled}
          changeTo={'admin'}
          memberId={memberId}
          updateRoleHandler={updateRoleHandler}
        />
      )}

      {toRoleCheck(changeRoleChecks, memberId, 'contributor') && (
        <RoleUpdateButton
          disabled={isDisabled}
          changeTo={'contributor'}
          memberId={memberId}
          updateRoleHandler={updateRoleHandler}
        />
      )}

      {toRoleCheck(changeRoleChecks, memberId, 'viewer') && (
        <RoleUpdateButton
          disabled={isDisabled}
          changeTo={'viewer'}
          memberId={memberId}
          updateRoleHandler={updateRoleHandler}
        />
      )}
    </>
  )
}

const mapStateToProps = () => ({})

export default connect(mapStateToProps)(GroupRoleUpdates)

GroupRoleUpdates.propTypes = {
  updateRole: PropTypes.func,
  toRoleCheck: PropTypes.func,
  memberId: PropTypes.number,
}

RoleUpdateButton.propTypes = {
  changeTo: PropTypes.string,
  updateRoleHandler: PropTypes.func,
  memberId: PropTypes.number,
  disabled: PropTypes.bool,
}
