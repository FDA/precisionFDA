import { FILE_STATE } from '@shared/domain/user-file/user-file.types'

export interface AdminDataConsistencyReportEntityInfo {
  id: number
  uid: string
  dxuser: string
  state: FILE_STATE | null
  entityType: string
  createdAt: Date
  elapsedTimeSinceCreation: string
}
