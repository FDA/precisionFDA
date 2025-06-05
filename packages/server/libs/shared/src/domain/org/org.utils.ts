import { DxId } from '../entity/domain/dxid'

const ORG_PREFIX = 'org-'
const PFDA_PREFIX = 'pfda..'
const ORG_HANDLE_MAX_LENGTH = 33

const constructDxOrg = (handle: string) => {
  // TODO maybe some validation?
  return (ORG_PREFIX + PFDA_PREFIX + handle) as DxId<'org'>
}

const getHandle = (id: string) => {
  return id.slice(id.indexOf(ORG_PREFIX) + ORG_PREFIX.length)
}

const getBaseHandle = (id: DxId<'org'>) => {
  const pattern = `${ORG_PREFIX}${PFDA_PREFIX}`
  return id.slice(id.indexOf(pattern) + pattern.length)
}

export { constructDxOrg, getBaseHandle, getHandle, ORG_HANDLE_MAX_LENGTH, ORG_PREFIX, PFDA_PREFIX }
