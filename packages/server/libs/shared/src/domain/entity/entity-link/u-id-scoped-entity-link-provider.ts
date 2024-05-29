import { Injectable } from '@nestjs/common'
import { EntityInstance } from '@shared/domain/entity/domain/entity-instance'
import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'
import { getIdFromScopeName } from '@shared/domain/space/space.helper'
import { STATIC_SCOPE } from '@shared/enums'
import { EntityUtils } from '@shared/utils/entity.utils'
import { Extends } from '@shared/utils/types/extends'

type UIdScopedLinkEntityType = Extends<EntityType, 'job' | 'asset' | 'file' | 'app' | 'workflow'>
type UIdScopedLinkEntity = EntityInstance<UIdScopedLinkEntityType>

@Injectable()
export class UIdScopedEntityLinkProvider extends EntityLinkProvider<UIdScopedLinkEntityType> {
  protected async getRelativeLink(entity: UIdScopedLinkEntity) {
    const scope = entity.scope

    if (this.MY_HOME_SCOPES.includes(scope)) {
      return this.getHomeLink(entity)
    }

    return this.getSpaceLink(entity, getIdFromScopeName(scope))
  }

  protected getHomeLink(entity: UIdScopedLinkEntity) {
    return `/home/${this.getUrlSegment(entity)}/${entity.uid}` as const
  }

  protected getSpaceLink(entity: UIdScopedLinkEntity, spaceId: number) {
    const urlSegment = this.getUrlSegment(entity)

    return `/spaces/${spaceId}/${urlSegment}/${entity.uid}` as const
  }

  private getUrlSegment(entity: UIdScopedLinkEntity): string {
    const entityType = EntityUtils.getEntityTypeForEntity(entity)

    return this.entityTypeToUrlSegmentMap[entityType]
  }

  private readonly entityTypeToUrlSegmentMap: Record<UIdScopedLinkEntityType, string> = {
    app: 'apps',
    asset: 'assets',
    job: 'executions',
    file: 'files',
    workflow: 'workflows',
  }
}
