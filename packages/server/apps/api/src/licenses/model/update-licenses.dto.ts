import { ArrayNotEmpty, IsArray, IsInt, Equals } from 'class-validator'
import { Type } from 'class-transformer'

export class UpdateLicensesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Type(() => Number)
  ids: number[]

  @Equals(true, { message: 'Only accepted: true is supported' })
  accepted: boolean
}
