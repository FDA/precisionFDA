import PropTypes from 'prop-types'


const UserShape = {
  id: PropTypes.number,
  name: PropTypes.string,
  org: PropTypes.string,
  url: PropTypes.string,
  isAccepted: PropTypes.bool,
  dxuser: PropTypes.string,
}

const mapToUser = (user) => {
  if (!user) return null

  return {
    id: user.id,
    name: user.name,
    org: user.org,
    url: user.user_url,
    isAccepted: user.is_accepted,
    dxuser: user.dxuser,
  }
}

export default UserShape

export {
  UserShape,
  mapToUser,
}
