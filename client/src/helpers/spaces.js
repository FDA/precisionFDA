const getSpacesIcon = (type) => {
  switch(type) {
    case 'members':
      return 'fa-group'
    case 'apps':
      return 'fa-cube'
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

const getSpaceMembersSides = (type) => {
  if (type === 'review') return { all: 'all', host: 'reviewer', guest: 'sponsor' }
  return { all: 'all', host: 'host', guest: 'guest' } // if space.type === ('groups' or verif.(old))
}

export {
  getSpacesIcon,
  getSpacePageTitle,
  getSpaceMembersSides,
}
