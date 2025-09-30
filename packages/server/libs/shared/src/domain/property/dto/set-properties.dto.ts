import { IsObject, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { EntityIdentifier } from '@shared/domain/entity/domain/entity-identifier'
import { IsValidEntityIdentifier } from '@shared/domain/entity/constraint/is-valid-entity-identifier.constraint'

export class Property {
  [key: string]: string
}

export class SetPropertiesDTO {
  @IsValidEntityIdentifier()
  targetId: EntityIdentifier

  @IsObject()
  @ValidateNested()
  @Type(() => Property)
  properties: Property
}
