import { config } from '.'
export const ORG_EVERYONE = `org-${config.platform.orgEveryoneHandle}`

export const DNANEXUS_INVALID_EMAIL = '@dnanexus.invalid'

export const UBUNTU_14 = '14.04'
export const UBUNTU_16 = '16.04'
export const UBUNTU_20 = '20.04'
export const UBUNTU_RELEASES = [UBUNTU_14, UBUNTU_16, UBUNTU_20]

export const VALID_IO_CLASSES = ['file', 'string', 'boolean', 'int', 'float', 'array:file',
  'array:string', 'array:boolean', 'array:int', 'array:float']

export const BILLING_INFO = {
  email: 'billing@dnanexus.com',
  name: 'Elaine Johanson',
  companyName: 'FDA',
  address1: '10903 New Hampshire Ave',
  address2: 'Bldg. 32 room 2254',
  city: 'Silver Spring',
  state: 'MD',
  postCode: '20993',
  country: 'USA',
  phone: '(301) 706-1836',
}

export const USER_CONTEXT_HTTP_HEADERS = {
  id: 'x-user_id',
  accessToken: 'x-accesstoken',
  dxUser: 'x-dxuser',
}
