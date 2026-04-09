import { IsOptional } from 'class-validator'
import { IsValidEntityIdentifier } from '@shared/domain/entity/constraint/is-valid-entity-identifier.constraint'
import { EntityIdentifier } from '@shared/domain/entity/domain/entity-identifier'
import { EntityWithProvenanceType } from '@shared/domain/provenance/model/entity-with-provenance.type'

export class EntityIdentifierQueryDTO {
  @IsValidEntityIdentifier()
  identifier: EntityIdentifier

  @IsOptional()
  type?: EntityWithProvenanceType
}
