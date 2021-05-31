export interface IUser {
  id: number,
  name: string,
  org: string,
  url: string,
  isAccepted: boolean,
  dxuser: string,
  admin: boolean
  can_access_notification_preference: boolean
  can_administer_site: boolean
  can_create_challenges: boolean
  can_see_spaces: boolean
  counters: {
    files: number,
    folders: number,
    apps: number,
    workflows: number,
    jobs: number,
    assets: number,
    notes: number
  }
  email: string
  first_name: string
  full_name: string
  gravatar_url: string
  is_guest: boolean
  last_name: string
  links: any
  handle: string
}
