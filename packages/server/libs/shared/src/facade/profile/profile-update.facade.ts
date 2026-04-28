import { EntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { ProfileViewDTO } from '@shared/domain/profile/dto/profile-view.dto'
import { UpdateOrganizationDTO } from '@shared/domain/profile/dto/update-organization.dto'
import { UpdateProfileDTO } from '@shared/domain/profile/dto/update-profile.dto'
import { ProfileService } from '@shared/domain/profile/service/profile.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { PermissionError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class ProfileUpdateFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: EntityManager,
    private readonly userCtx: UserContext,
    private readonly profileService: ProfileService,
  ) {}

  async updateProfile(dto: UpdateProfileDTO): Promise<ProfileViewDTO> {
    const user = await this.userCtx.loadEntity()
    return this.profileService.updateProfile(user, dto)
  }

  async updateTimeZone(timeZone: string): Promise<void> {
    const user = await this.userCtx.loadEntity()
    user.timeZone = timeZone
    await this.em.flush()
    this.logger.log(`Time zone updated for user ${user.id} to ${timeZone}`)
  }

  async updateOrganizationName(name: string): Promise<UpdateOrganizationDTO> {
    const user = await this.userCtx.loadEntity()
    await this.em.populate(user, ['organization', 'organization.admin'])

    const org = user.organization.getEntity()

    if (org.admin?.id !== user.id) {
      throw new PermissionError('Only organization administrators can update the organization name')
    }

    org.name = name
    await this.em.flush()

    this.logger.log(`Organization ${org.id} name updated to "${name}" by user ${user.id}`)

    return { name: org.name }
  }
}
