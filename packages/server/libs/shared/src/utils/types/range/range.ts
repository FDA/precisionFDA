import { IsOptional } from 'class-validator'

export class Range<T = number | Date> {
  @IsOptional()
  lower?: T

  @IsOptional()
  upper?: T
}
