import { EntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { OrgUsersListDTO } from '@shared/domain/profile/dto/org-users-list.dto'
import { ProfilePageDTO } from '@shared/domain/profile/dto/profile-page.dto'
import { ProfileService } from '@shared/domain/profile/service/profile.service'
import { UserService } from '@shared/domain/user/service/user.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'

@Injectable()
export class ProfileReadFacade {
  constructor(
    private readonly em: EntityManager,
    private readonly userCtx: UserContext,
    private readonly profileService: ProfileService,
    private readonly userService: UserService,
  ) {}

  async getProfilePage(): Promise<ProfilePageDTO> {
    const user = await this.userCtx.loadEntity()
    await this.em.populate(user, ['organization', 'organization.admin'])

    const profile = await this.profileService.getProfileViewFields(user)

    return ProfilePageDTO.fromEntity(user, profile)
  }

  async getOrganizationUsers(): Promise<OrgUsersListDTO> {
    const user = await this.userCtx.loadEntity()
    await this.em.populate(user, ['organization', 'organization.admin'])

    const org = user.organization.getEntity()

    if (org.singular === true) {
      return OrgUsersListDTO.fromEntities([user])
    }

    const orgUsers = await this.userService.getUsersInOrganization(org.id)

    return OrgUsersListDTO.fromEntities(orgUsers, org.admin?.id)
  }
}
