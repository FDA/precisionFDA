import { IFile } from '../files/files.types'

export type SpaceReportState = 'CREATED' | 'DONE' | 'ERROR' | 'CLOSING_RESULT_FILE'

export type SpaceReportFormatToOptionsMap = {
  HTML: never
  JSON: { prettyPrint: boolean }
}

export type SpaceReportFormat = keyof SpaceReportFormatToOptionsMap

export interface ISpaceReport<T extends SpaceReportFormat = SpaceReportFormat> {
  id: number
  resultFile: IFile
  state: SpaceReportState
  createdAt: Date
  format: T
  options: SpaceReportFormatToOptionsMap[T]
}
