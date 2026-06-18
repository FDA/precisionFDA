import { Type } from 'class-transformer'
import { IsDate, IsOptional } from 'class-validator'
import { Range } from './range'

export class DateRange extends Range<Date> {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lower?: Date

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  upper?: Date
}
