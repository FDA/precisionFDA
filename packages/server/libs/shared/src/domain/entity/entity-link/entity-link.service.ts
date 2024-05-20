import { Inject, Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { DownloadLinkOptionsDto } from '@shared/domain/entity/domain/download-link-options.dto'
import { EntityInstance } from '@shared/domain/entity/domain/entity-instance'
import { DownloadableEntityType } from '@shared/domain/entity/entity-link/domain/downloadable-entity.type'
import { UiLinkableEntityType } from '@shared/domain/entity/entity-link/domain/ui-linkable-entity.type'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'
import { ENTITY_TYPE_TO_LINK_PROVIDER_MAP } from '@shared/domain/entity/entity-link/provider/entity-type-to-link-provider-map.provider'
import { PlatformClient } from '@shared/platform-client'
import { EntityUtils } from '@shared/utils/entity.utils'
import { TimeUtils } from '@shared/utils/time.utils'

@Injectable()
export class EntityLinkService {
  constructor(
    @Inject(ENTITY_TYPE_TO_LINK_PROVIDER_MAP)
    private readonly entityTypeToLinkProviderMap: {
      [T in UiLinkableEntityType]: EntityLinkProvider<T>
    },
    private readonly platformClient: PlatformClient,
  ) {}

  private static readonly DOWNLOAD_LINK_OPTIONS_DEFAULT = {
    preauthenticated: false,
    duration: TimeUtils.hoursToSeconds(24),
    inline: false,
  }

  async getUiLink<T extends UiLinkableEntityType>(entity: EntityInstance<T>) {
    const entityType = EntityUtils.getEntityTypeForEntity(entity)
    const linkProvider = this.entityTypeToLinkProviderMap[entityType]

    if (!linkProvider) {
      throw new Error(`No link provider found for entity type "${entityType}"`)
    }

    return linkProvider.getLink(entity)
  }

  async getDownloadLink(
    entity: EntityInstance<DownloadableEntityType>,
    fileName: string,
    options?: DownloadLinkOptionsDto,
  ) {
    const effectiveOptions = { ...EntityLinkService.DOWNLOAD_LINK_OPTIONS_DEFAULT, ...options }
    const url = await this.getDownloadLinkUrl(entity, fileName, effectiveOptions)

    if (effectiveOptions.inline) {
      url.searchParams.append('inline', 'true')
    }

    return url.toString()
  }

  private async getDownloadLinkUrl(
    entity: EntityInstance<DownloadableEntityType>,
    fileName: string,
    options: DownloadLinkOptionsDto,
  ): Promise<URL> {
    if (options.preauthenticated) {
      const link = await this.platformClient.fileDownloadLink({
        fileDxid: entity.dxid,
        filename: fileName,
        project: entity.project,
        duration: options.duration,
        preauthenticated: options.preauthenticated,
      })

      return new URL(link.url)
    }

    return new URL(
      `${config.api.railsHost}/api/files/${entity.uid}/${encodeURIComponent(fileName)}`,
    )
  }
}
