import { Injectable } from '@nestjs/common'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'
import { Expert } from '@shared/domain/expert/entity/expert.entity'

@Injectable()
export class ExpertEntityLinkProvider extends EntityLinkProvider<'expert'> {
  protected async getRelativeLink(expert: Expert): Promise<`/experts/${number}`> {
    return `/experts/${expert.id}` as const
  }
}
