import { SpaceReportPartProvenanceTreeResult } from '@shared/domain/space-report/model/space-report-part-provenance-tree-result'
import { SpaceReportPartUserTileResult } from '@shared/domain/space-report/model/space-report-part-user-tile-result'

export interface SpaceReportPartTypeToResultMap {
  file: SpaceReportPartProvenanceTreeResult
  app: SpaceReportPartProvenanceTreeResult
  job: SpaceReportPartProvenanceTreeResult
  asset: SpaceReportPartProvenanceTreeResult
  workflow: SpaceReportPartProvenanceTreeResult
  user: SpaceReportPartUserTileResult
}
