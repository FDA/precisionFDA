// eslint-disable-next-line
import { SPACE_GROUPS, SPACE_REVIEW } from '../constants'

const getSpacesIcon = type => {
  switch (type) {
    case 'members':
      return 'fa-group'
    case 'apps':
      return 'fa-cube'
    case 'databases':
      return 'fa-database'
    case 'experts':
      return 'fa-star-o'
    case 'jobs':
      return 'fa-cogs'
    case 'workflows':
      return 'fa-bolt'
    case 'files':
      return 'fa-files-o'
    case 'reports':
      return 'fa-bar-chart'
    case 'disable':
      return 'fa-minus-circle'
    case 'enable':
      return 'fa-plus-circle'
    case 'external':
      return 'fa-external-link'
    case 'lead':
    case 'admin':
    case 'contributor':
    case 'viewer':
      return 'fa-star'
    case 'space':
      return 'fa-object-group'
    default:
      return ''
  }
}

const getSpacePageTitle = (pageTitle, isPrivate) => {
  if (isPrivate) return `Private Area ${pageTitle}`
  return `Shared Area ${pageTitle}`
}

const getSpaceMembersSides = type => {
  if (type === SPACE_REVIEW) {
    return { all: 'all', host: 'reviewer', guest: 'sponsor' }
  }
  return { all: 'all', host: 'host', guest: 'guest' } // if space.type === ('groups' or verif.(old))
}

const getHostLeadLabel = (type) => {
  if (type === SPACE_REVIEW) {
    return 'Reviewer Lead'
  } else if (type === SPACE_GROUPS) {
    return 'Host Lead'
  }
  return ''
}

const getGuestLeadLabel = (type) => {
  if (type === SPACE_REVIEW) {
    return 'Reviewer Lead'
  } else if (type === SPACE_GROUPS) {
    return 'Guest Lead'
  }
  return ''
}

export {
  getSpacesIcon,
  getSpacePageTitle,
  getSpaceMembersSides,
  getHostLeadLabel,
  getGuestLeadLabel,
}
