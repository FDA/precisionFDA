import { config } from '@shared/config'
import { entityTypeToEntityMap } from '@shared/domain/entity/domain/entity-type-to-entity.map'
import { EntityType } from '@shared/domain/entity/domain/entity.type'

interface GetLinkOptions {
  absolute?: boolean
}

export abstract class EntityLinkProvider<T extends EntityType> {
  protected abstract getRelativeLink(
    entity: InstanceType<(typeof entityTypeToEntityMap)[T]>,
  ): Promise<`/${string}`>

  async getLink(
    entity: InstanceType<(typeof entityTypeToEntityMap)[T]>,
    { absolute = true }: GetLinkOptions = {},
  ): Promise<string> {
    const relativeLink = await this.getRelativeLink(entity)

    if (absolute) {
      return `${config.api.railsHost}${relativeLink}`
    }

    return relativeLink
  }
}
