import { Injectable } from '@nestjs/common'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'
import { Resource } from '@shared/domain/resource/resource.entity'

@Injectable()
export class ResourceEntityLinkProvider extends EntityLinkProvider<'resource'> {
  protected async getRelativeLink(entity: Resource) {
    const f = entity.userFile.getEntity()
    return `/api/resources/${f.uid}/${f.name}` as const
  }
}
