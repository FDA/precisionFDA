import PropTypes from 'prop-types'


// N.B. in Rails both SpaceMemberSerializer and UserSerializer emit user objects
//      currently mapToUser attempts to cater to both serialized objects
const UserShape = {
  id: PropTypes.number,
  name: PropTypes.string,
  org: PropTypes.string,
  url: PropTypes.string,
  isGuest: PropTypes.bool,
  isAccepted: PropTypes.bool,
  dxuser: PropTypes.string,
}

const mapToUser = (user) => {
  if (!user) return null

  const name = user.name ? user.name : `${user.first_name} ${user.last_name}`
  return {
    id: user.id,
    name: name,
    org: user.org,
    url: user.user_url,
    isGuest: user.is_guest,
    isAccepted: user.is_accepted,
    dxuser: user.dxuser,
  }
}

export default UserShape

export {
  UserShape,
  mapToUser,
}
