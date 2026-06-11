import { AdminDataConsistencyReportEntityInfo } from './admin-data-consistency-report-entity-info'
import { AdminDataConsistencyReportNodeWithParent } from './admin-data-consistency-report-node-with-parent'
import { AdminDataConsistencyReportRunningJobInfo } from './admin-data-consistency-report-running-job-info'
import { AdminDataConsistencyReportSpaceInfo } from './admin-data-consistency-report-space-info'

export type AdminDataConsistencyReportOutput = {
  pfdaOnlyFoldersCount?: number
  pfdaOnlyFolders?: AdminDataConsistencyReportEntityInfo[]
  foldersWithParentCount?: number
  foldersWithParent?: AdminDataConsistencyReportNodeWithParent[]
  unclosedFilesCount?: number
  unclosedFiles?: AdminDataConsistencyReportEntityInfo[]
  runningJobs?: AdminDataConsistencyReportRunningJobInfo[]
  runningJobsCount?: number
  legacyOrgs?: Record<string, unknown>[]
  legacyOrgsCount?: number
  spaces?: AdminDataConsistencyReportSpaceInfo[]
  spacesWithErrorsCount?: number
}
