import { Injectable } from '@nestjs/common'
import { entityTypeToEntityMap } from '@shared/domain/entity/domain/entity-type-to-entity.map'
import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { EntityIconService } from '@shared/domain/entity/entity-icon/entity-icon.service'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'

@Injectable()
export class EntityService {
  constructor(
    private readonly entityLinkService: EntityLinkService,
    private readonly entityIconService: EntityIconService,
  ) {}

  getEntityLink(entity: InstanceType<(typeof entityTypeToEntityMap)[EntityType]>) {
    return this.entityLinkService.getLink(entity)
  }

  getEntityIcon(entityType: EntityType) {
    return this.entityIconService.getIcon(entityType)
  }
}
