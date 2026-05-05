import { Equals } from 'class-validator'

export class UpdateLicenseDto {
  @Equals(true, { message: 'Only accepted: true is supported' })
  accepted: boolean
}
