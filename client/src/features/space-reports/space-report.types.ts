import { IFile } from '../files/files.types'

export type SpaceReportState = 'CREATED' | 'DONE' | 'ERROR' | 'CLOSING_RESULT_FILE'

export interface ISpaceReport {
  id: number
  resultFile: IFile
  state: SpaceReportState
  createdAt: Date
}
