import PropTypes from 'prop-types'

import { mapToSpace, SpaceShape } from './SpaceShape'


const SpaceListShape = {
  id: PropTypes.number,
  hasPrivate: PropTypes.bool,
  private: PropTypes.exact(SpaceShape),
  shared: PropTypes.exact(SpaceShape),
}

const  mapToSpaceList = (data) => {
  let hasPrivate = false
  let privateArea = {}

  if (data.confidential_space) {
    hasPrivate = true
    privateArea = mapToSpace(data.confidential_space)
  }

  const sharedArea = mapToSpace(data)

  return {
    id: data.id,
    hasPrivate: hasPrivate,
    private: privateArea,
    shared: sharedArea,
  }
}

export default SpaceListShape

export {
  SpaceListShape,
  mapToSpaceList,
}
