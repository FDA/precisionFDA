import { IsNotEmpty, IsString } from 'class-validator'
import { IsValidTimezone } from '../constraint/is-valid-timezone.constraint'

export class UpdateTimezoneDTO {
  @IsString()
  @IsNotEmpty()
  @IsValidTimezone()
  timeZone: string
}
