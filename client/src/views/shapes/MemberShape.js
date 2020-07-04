import PropTypes from 'prop-types'


const MemberShape = {
  id: PropTypes.number,
  userName: PropTypes.string,
  title: PropTypes.string,
  role: PropTypes.string,
  side: PropTypes.string,
  org: PropTypes.string,
  createdAt: PropTypes.string,
  active: PropTypes.bool,
  links: PropTypes.object,
  availableRoles: PropTypes.array,
}

const mapToMember = (data) => {
  return {
    id: data.id,
    userName: data.user_name,
    title: data.title,
    role: data.role,
    side: data.side,
    org: data.org,
    createdAt: data.created_at,
    active: data.active,
    links: data.links,
    availableRoles: data.to_roles || [],
  }
}

export default MemberShape

export {
  MemberShape,
  mapToMember,
}
