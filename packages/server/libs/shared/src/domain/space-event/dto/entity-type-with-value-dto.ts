import { IsIn, ValidateNested } from 'class-validator'
import { EntityType } from '@shared/utils/object-utils'
import { ObjectIdInputDTO } from '@shared/domain/email/email.helper'
import { Type } from 'class-transformer'
import { entityTypes } from '@shared/domain/entity/domain/entity.type'

export class EntityTypeWithValueDTO {
  @IsIn(entityTypes)
  type: EntityType

  @ValidateNested()
  @Type(() => ObjectIdInputDTO)
  value: ObjectIdInputDTO
}
