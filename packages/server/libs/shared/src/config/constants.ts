const ONE_MINUTE_SECONDS = 60
const ONE_DAY_SECONDS = 24 * 60 * 60

export const MAX_JOB_DURATION_SECONDS = 30 * ONE_DAY_SECONDS - 5 * ONE_MINUTE_SECONDS // 30 days - 5 minutes
export const MAX_PLATFORM_ALLOWED_TIMEOUT_SECONDS = 30 * ONE_DAY_SECONDS // 30 days

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
