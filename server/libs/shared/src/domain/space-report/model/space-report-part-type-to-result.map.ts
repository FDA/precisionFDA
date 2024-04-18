import { SpaceReportPartDiscussionResult } from '@shared/domain/space-report/model/space-report-part-discussion-result'
import {
  SpaceReportPartProvenanceTreeHtmlResult,
  SpaceReportPartProvenanceTreeJsonResult,
} from '@shared/domain/space-report/model/space-report-part-provenance-tree-result'
import {
  SpaceReportPartUserTileHtmlResult,
  SpaceReportPartUserTileJsonResult,
} from '@shared/domain/space-report/model/space-report-part-user-tile-result'

export interface SpaceReportPartProvenanceTreeResult {
  HTML: SpaceReportPartProvenanceTreeHtmlResult
  JSON: SpaceReportPartProvenanceTreeJsonResult
}

export interface SpaceReportPartTypeToResultMap {
  file: SpaceReportPartProvenanceTreeResult
  app: SpaceReportPartProvenanceTreeResult
  job: SpaceReportPartProvenanceTreeResult
  asset: SpaceReportPartProvenanceTreeResult
  workflow: SpaceReportPartProvenanceTreeResult
  user: {
    HTML: SpaceReportPartUserTileHtmlResult
    JSON: SpaceReportPartUserTileJsonResult
  }
  discussion: {
    HTML: SpaceReportPartDiscussionResult
    JSON: SpaceReportPartDiscussionResult
  }
}
