import { IFile } from '../files/files.types'

export type LicenseRef = IFile['fileLicense']

export type LicenseCarrier = {
  uid?: string
  dxid?: string
  fileLicense?: LicenseRef | null
  file_license?: LicenseRef | null
}

