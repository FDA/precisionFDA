import { Type } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { IsValidEntityIdentifier } from '@shared/domain/entity/constraint/is-valid-entity-identifier.constraint'
import { EntityIdentifier } from '@shared/domain/entity/domain/entity-identifier'

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
