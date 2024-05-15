import { Injectable } from '@nestjs/common'
import { DownloadLinkOptionsDto } from '@shared/domain/entity/domain/download-link-options.dto'
import { EntityInstance } from '@shared/domain/entity/domain/entity-instance'
import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { EntityIconService } from '@shared/domain/entity/entity-icon/entity-icon.service'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'
import { DownloadableEntityType } from '@shared/domain/entity/entity-link/domain/downloadable-entity.type'
import { UiLinkableEntityType } from '@shared/domain/entity/entity-link/domain/ui-linkable-entity.type'

@Injectable()
export class EntityService {
  constructor(
    private readonly entityLinkService: EntityLinkService,
    private readonly entityIconService: EntityIconService,
  ) {}

  getEntityUiLink(entity: EntityInstance<UiLinkableEntityType>) {
    return this.entityLinkService.getUiLink(entity)
  }

  getEntityDownloadLink(
    entity: EntityInstance<DownloadableEntityType>,
    fileName: string,
    options?: DownloadLinkOptionsDto,
  ) {
    return this.entityLinkService.getDownloadLink(entity, fileName, options)
  }

  getEntityIcon(entityType: EntityType) {
    return this.entityIconService.getIcon(entityType)
  }
}
