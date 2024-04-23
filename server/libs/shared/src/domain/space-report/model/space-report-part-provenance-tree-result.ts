import { EntityProvenance } from '@shared/domain/provenance/model/entity-provenance'
import { SpaceReportPartProvenanceTreeResultMeta } from './space-report-part-provenance-tree-result-meta'

export interface SpaceReportPartProvenanceTreeHtmlResult
  extends SpaceReportPartProvenanceTreeResultMeta {
  svg: string
}

export interface SpaceReportPartProvenanceTreeJsonResult
  extends SpaceReportPartProvenanceTreeResultMeta {
  provenance: EntityProvenance
}
