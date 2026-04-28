import type { Profile } from '../profile.entity'

export class ProfileViewDTO {
  emailConfirmed: boolean
  email: string

  static fromEntity(profile: Profile): ProfileViewDTO {
    const dto = new ProfileViewDTO()
    dto.emailConfirmed = profile.emailConfirmed
    dto.email = profile.email ?? ''
    return dto
  }
}
