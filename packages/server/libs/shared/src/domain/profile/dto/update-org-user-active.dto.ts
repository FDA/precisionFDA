import { Equals, IsBoolean } from 'class-validator'

export class UpdateOrgUserActiveDTO {
  @IsBoolean()
  @Equals(false)
  active: boolean
}
