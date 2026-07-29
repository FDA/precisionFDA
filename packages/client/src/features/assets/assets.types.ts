import type { FileOrg, FileUser } from '../apps/apps.types'
import type { FileState } from '../files/files.types'
import type { ServerScope } from '../home/types'

type Links = Record<string, string>

export interface FileLicense {
  id: string
  title: string
  uid: string
  approvalRequired?: boolean
  acceptanceStatus?: string | null
}

// TODO: revisit this type, doesn't look correct to me.
// list_assets returns very similar results as list_files and the attributes listed here are not there
export interface IAsset {
  id: number
  uid: string
  dxid: string
  entity_type: string
  state: FileState
  file_size: string
  file_license: FileLicense
  show_license_pending: boolean
  // Optional camelCase aliases for any mapped responses.
  fileLicense?: FileLicense
  // still used in other domains, but eventually will be replaced by fileLicense
  showLicensePending?: boolean
  name: string
  title: string
  description: string
  added_by: string
  added_by_fullname: string
  added_by_user_id: number
  archive_content: string[]
  created_at: string
  created_at_date_time: string
  updated_at: Date
  location: string
  readme: string
  revision: number
  public: boolean
  private: boolean
  in_space: boolean
  app_series_id: number
  run_by_you: string
  org: FileOrg
  path: string
  origin:
    | {
        text?: string
        fa?: string
        href?: string
      }
    | string
  explorers: number
  featured: boolean
  scope: ServerScope
  user: FileUser
  active: boolean
  /** @deprecated create links from client side */
  links: Links
  tags: string[]
  properties: {
    [key: string]: string
  }
}
