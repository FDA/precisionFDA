import { config } from '.'
export const ORG_EVERYONE = `org-${config.platform.orgEveryoneHandle}`

export const DNANEXUS_INVALID_EMAIL = '@dnanexus.invalid'

export const UBUNTU_14 = '14.04'
export const UBUNTU_16 = '16.04'
export const UBUNTU_20 = '20.04'
export const UBUNTU_24 = '24.04'
export const UBUNTU_RELEASES = [UBUNTU_14, UBUNTU_16, UBUNTU_20, UBUNTU_24]

export const VALID_IO_CLASSES = [
  'file',
  'string',
  'boolean',
  'int',
  'float',
  'array:file',
  'array:string',
  'array:boolean',
  'array:int',
  'array:float',
]

export const USER_CONTEXT_HTTP_HEADERS = {
  csrfToken: 'x-csrf-token',
  userAgent: 'user-agent',
}

export const COOKIE_SESSION_KEY = '_precision-fda_session'
