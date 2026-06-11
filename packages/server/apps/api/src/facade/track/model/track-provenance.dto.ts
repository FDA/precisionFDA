import { EntityIdentifier } from '@shared/domain/entity/domain/entity-identifier'

export class TrackProvenanceDTO {
  identifier!: EntityIdentifier
  name!: string
  svg!: string
}
