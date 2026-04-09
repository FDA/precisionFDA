import { Type } from 'class-transformer'
import { IsIn, ValidateNested } from 'class-validator'
import { ObjectIdInputDTO } from '@shared/domain/email/dto/object-id.dto'
import { ENTITY_TYPE_KEYSET, EntityType } from '@shared/utils/object-utils'

export class EntityTypeWithValueDTO {
  @IsIn(ENTITY_TYPE_KEYSET)
  type: EntityType

  @ValidateNested()
  @Type(() => ObjectIdInputDTO)
  value: ObjectIdInputDTO
}
