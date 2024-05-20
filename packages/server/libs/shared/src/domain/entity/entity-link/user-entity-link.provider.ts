import { Injectable } from '@nestjs/common'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'
import { User } from '@shared/domain/user/user.entity'

@Injectable()
export class UserEntityLinkProvider extends EntityLinkProvider<'user'> {
  protected async getRelativeLink(entity: User) {
    return `/users/${entity.dxuser}` as const
  }
}
