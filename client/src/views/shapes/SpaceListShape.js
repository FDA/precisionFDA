import PropTypes from 'prop-types'

// eslint-disable-next-line
import { mapToSpace, SpaceShape } from './SpaceShape'

const SpaceListShape = {
  id: PropTypes.number,
  hasPrivate: PropTypes.bool,
  private: PropTypes.exact(SpaceShape),
  shared: PropTypes.exact(SpaceShape),
}

const mapToSpaceList = data => {
  let hasPrivate = false
  let privateArea = {}

  if (data.confidential_space) {
    hasPrivate = true
    privateArea = mapToSpace(data.confidential_space)
  } else if (data.private_exclusive) {
    hasPrivate = true
    privateArea = mapToSpace(data)
  }

  let sharedArea
  if (!data.private_exclusive) {
    sharedArea = mapToSpace(data)
  }

  return {
    id: data.id,
    hasPrivate: hasPrivate,
    private: privateArea,
    shared: sharedArea,
  }
}

export default SpaceListShape

export { SpaceListShape, mapToSpaceList }
