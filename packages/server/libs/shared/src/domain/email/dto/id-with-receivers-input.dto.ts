import { IsArray, IsNumber } from 'class-validator'
import { ObjectIdInputDTO } from '@shared/domain/email/dto/object-id.dto'

export class IdWithReceiversInputDTO extends ObjectIdInputDTO {
  @IsArray()
  @IsNumber({}, { each: true })
  receiverUserIds: number[]
}
