import PropTypes from 'prop-types'


const MembersRolesCheckShape = {
  roleChangeChecks: PropTypes.object,
}

const mapToMembersRolesCheck = ({ data }) => {
  return {
    roleChangeChecks: data.role_change_checks,
  }
}

export default MembersRolesCheckShape

export {
  MembersRolesCheckShape,
  mapToMembersRolesCheck,
}
