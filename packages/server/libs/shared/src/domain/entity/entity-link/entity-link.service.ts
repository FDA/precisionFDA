import { Inject, Injectable } from '@nestjs/common'
import { entityTypeToEntityMap } from '@shared/domain/entity/domain/entity-type-to-entity.map'
import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'
import { ENTITY_TYPE_TO_LINK_PROVIDER_MAP } from '@shared/domain/entity/entity-link/provider/entity-type-to-link-provider-map.provider'
import { EntityUtils } from '@shared/utils/entity.utils'

@Injectable()
export class EntityLinkService {
  constructor(
    @Inject(ENTITY_TYPE_TO_LINK_PROVIDER_MAP)
    private readonly entityTypeToLinkProviderMap: { [T in EntityType]: EntityLinkProvider<T> },
  ) {}

  getLink<T extends EntityType>(entity: InstanceType<(typeof entityTypeToEntityMap)[T]>) {
    const entityType = EntityUtils.getEntityTypeForEntity(entity)
    const linkProvider = this.entityTypeToLinkProviderMap[entityType]

    if (!linkProvider) {
      throw new Error(`No link provider found for entity type "${entityType}"`)
    }

    return linkProvider.getLink(entity)
  }
}
