import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import MemberShape from '../../../../shapes/MemberShape'
import LinkTargetBlank from '../../../LinkTargetBlank'
import './style.sass'
import GroupRoleUpdates from '../GroupRoleUpdates'


const MemberCard = ({ member, updateRole, updateRoleData }) => {
  const memberRole = (member) => {
    if (member.active) {
      return member.role
    } else {
      return `${member.role} (disabled)`
    }
  }

  const classMemberCard = classNames({
    'space-member-card': member.active,
    'space-member-card space-member-card__inactive': !member.active,
  })
  const classMemberCardHeader = classNames({
    'space-member-card__header': member.active,
    'space-member-card__header__inactive': !member.active,
  })

  return (
    <div className={classMemberCard}>
      <div className={classMemberCardHeader}>
        <div className="space-member-card__title">
          <LinkTargetBlank url={member.links.user}>
            <img src={member.links.gravatar} className="img-circle" alt=""/>
            <span>&nbsp;&nbsp;{member.title}</span>
          </LinkTargetBlank>
        </div>
      </div>

      <div className="space-member-row">
        <div className="space-member-card__date">
          <div className="space-member-card__date-label">Username:</div>
          <div className="space-member-card__date-value">
            <LinkTargetBlank url={member.links.user}>
              <span>{member.userName}</span>
            </LinkTargetBlank>
          </div>
        </div>
        <div className="space-member-card__date">
          <div className="space-member-card__date-label">Role:</div>
          <div className="space-member-card__date-value">{memberRole(member)}</div>
        </div>
        <div className="space-member-card__date">
          <div className="space-member-card__date-label">Organization:</div>
          <div className="space-member-card__date-value">{member.org}</div>
        </div>
        <div className="space-member-card__date">
          <div className="space-member-card__date-label">Joined on:</div>
          <div className="space-member-card__date-value">{member.createdAt}</div>
        </div>
      </div>

      <div className="space-member-row">
        <GroupRoleUpdates
          member={member}
          updateRole={updateRole}
          updateRoleData={updateRoleData}
      />
      </div>
    </div>
  )
}
export default MemberCard

MemberCard.propTypes = {
  member: PropTypes.exact(MemberShape),
  updateRole: PropTypes.func,
  updateRoleData: PropTypes.object,
}
