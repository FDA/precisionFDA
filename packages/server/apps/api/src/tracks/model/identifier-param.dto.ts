import { IsValidEntityIdentifier } from '@shared/domain/entity/constraint/is-valid-entity-identifier.constraint'
import { EntityIdentifier } from '@shared/domain/entity/domain/entity-identifier'

export class TrackEntityIdentifierQueryDto {
  @IsValidEntityIdentifier()
  identifier: EntityIdentifier
}
