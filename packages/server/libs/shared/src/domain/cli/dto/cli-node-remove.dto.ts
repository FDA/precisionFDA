import { IsArray, IsNumber, ValidateIf } from 'class-validator'
import { Uid } from '@shared/domain/entity/domain/uid'

export class CliNodeRemoveDTO {
  @IsArray()
  @ValidateIf(obj => !obj.ids)
  uids: Uid<'file'>[]

  @IsArray()
  @IsNumber({}, { each: true })
  @ValidateIf(obj => !obj.uids)
  ids: number[]
}
