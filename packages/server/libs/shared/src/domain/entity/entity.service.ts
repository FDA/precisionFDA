import { Injectable } from '@nestjs/common'
import { DownloadLinkOptionsDto } from '@shared/domain/entity/domain/download-link-options.dto'
import { EntityInstance } from '@shared/domain/entity/domain/entity-instance'
import { EntityIconService } from '@shared/domain/entity/entity-icon/entity-icon.service'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'
import { DownloadableEntityType } from '@shared/domain/entity/entity-link/domain/downloadable-entity.type'
import { UiLinkableEntityType } from '@shared/domain/entity/entity-link/domain/ui-linkable-entity.type'
import { EntityWithIconType } from '@shared/domain/entity/entity-icon/entity-with-icon.type'

@Injectable()
export class EntityService {
  constructor(
    private readonly entityLinkService: EntityLinkService,
    private readonly entityIconService: EntityIconService,
  ) {}

  getEntityUiLink(entity: EntityInstance<UiLinkableEntityType>, suffix?: string): Promise<string> {
    return this.entityLinkService.getUiLink(entity, suffix)
  }

  getEntityDownloadLink(
    entity: EntityInstance<DownloadableEntityType>,
    fileName: string,
    options?: DownloadLinkOptionsDto,
  ): Promise<string> {
    return this.entityLinkService.getDownloadLink(entity, fileName, options)
  }

  getEntityIcon(entityType: EntityWithIconType): Promise<string> {
    return this.entityIconService.getIcon(entityType)
  }
}
