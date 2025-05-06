import { IsIn, ValidateNested } from 'class-validator'
import { ENTITY_TYPE_KEYSET, EntityType } from '@shared/utils/object-utils'
import { ObjectIdInputDTO } from '@shared/domain/email/email.helper'
import { Type } from 'class-transformer'

export class EntityTypeWithValueDTO {
  @IsIn(ENTITY_TYPE_KEYSET)
  type: EntityType

  @ValidateNested()
  @Type(() => ObjectIdInputDTO)
  value: ObjectIdInputDTO
}
