import { EntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { InvalidStateError, ValidationError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { User } from '../../user/user.entity'
import { ProfileViewDTO } from '../dto/profile-view.dto'
import { UpdateProfileDTO } from '../dto/update-profile.dto'
import { Profile } from '../profile.entity'
import { ProfileRepository } from '../profile.repository'
import { PlatformClient } from '@shared/platform-client'

@Injectable()
export class ProfileService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: EntityManager,
    private readonly profileRepository: ProfileRepository,
    private readonly platformClient: PlatformClient,
  ) {}

  /**
   * Gets or creates a profile for the given user.
   * This mirrors the Rails Profiles::Getter service.
   */
  async getOrCreateProfile(user: User): Promise<Profile> {
    // Check if profile already exists
    let profile = await this.profileRepository.findByUserId(user.id)

    if (profile !== null) {
      return profile
    }

    profile = new Profile(user)
    profile.email = user.normalizedEmail

    this.em.persist(profile)
    await this.em.flush()
    return profile
  }

  /**
   * Gets the profile view fields for the user
   */
  async getProfileViewFields(user: User): Promise<ProfileViewDTO> {
    const profile = await this.getOrCreateProfile(user)
    return ProfileViewDTO.fromEntity(profile)
  }

  /**
   * Updates the profile with the given data.
   * This mirrors the Rails Profiles::Updater service.
   */
  async updateProfile(user: User, dto: UpdateProfileDTO): Promise<ProfileViewDTO> {
    let profile = await this.profileRepository.findByUserId(user.id)

    if (profile === null) {
      profile = new Profile(user)
      profile.email = user.normalizedEmail
      this.em.persist(profile)
    }

    // Validate email change if requested
    const emailChanged = dto.email && dto.email.toLowerCase() !== profile.email?.toLowerCase()

    if (emailChanged) {
      // TODO PFDA-6865 - account for platform email change
      const newEmail = dto.email?.toLowerCase()
      if (!newEmail) {
        throw new InvalidStateError('Email is required to change email')
      }

      // Handle email change (requires authentication verification)
      if (!dto.password || !dto.otp) {
        throw new InvalidStateError('Password and OTP are required to change email')
      }

      // Check if email is already in use
      const existingProfile = await this.profileRepository.findByEmail(newEmail)
      if (existingProfile && existingProfile.id !== profile.id) {
        throw new ValidationError('Email is already in use')
      }

      await this.platformClient.userUpdateEmail({
        dxid: user.dxid,
        data: {
          newEmail,
          password: dto.password,
          otp: dto.otp,
        },
      })

      // We intentionally persist only Profile.email here; User.email is synchronized
      // from platform state and should not be directly mutated by profile update flow.
      profile.email = newEmail
      profile.emailConfirmed = false
    }

    await this.em.flush()

    this.logger.log(`Profile updated for user ${user.id}`)

    return ProfileViewDTO.fromEntity(profile)
  }
}
