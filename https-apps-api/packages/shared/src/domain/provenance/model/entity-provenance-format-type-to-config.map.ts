import { EntityProvenance } from './entity-provenance'
import { EntityProvenanceSvgOptions } from './entity-provenance-svg-options'

export interface EntityProvenanceFormatTypeToConfigMap {
  raw: {
    returnType: EntityProvenance
    options: never
  }
  svg: {
    returnType: string
    options: EntityProvenanceSvgOptions
  }
}
