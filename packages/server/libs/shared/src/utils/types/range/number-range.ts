import { Type } from 'class-transformer'
import { IsNumber, IsOptional } from 'class-validator'
import { Range } from './range'

export class NumberRange extends Range<number> {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lower?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  upper?: number
}
