import { IFile } from '../files/files.types'

export type SpaceReportState = 'CREATED' | 'DONE' | 'ERROR'

export interface ISpaceReport {
  id: number
  resultFile: IFile
  state: SpaceReportState
  createdAt: Date
}
