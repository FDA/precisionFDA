
const ORG_PREFIX = 'org-'
const PFDA_PREFIX = 'pfda..'

const constructDxOrg = (handle: string) => {
  // TODO maybe some validation?
  return ORG_PREFIX + PFDA_PREFIX + handle
}

const getHandle = (id: string) => {
  const pattern = "org-"
  return id.slice(id.indexOf(pattern) + pattern.length)
}

export { ORG_PREFIX, PFDA_PREFIX, constructDxOrg, getHandle }
