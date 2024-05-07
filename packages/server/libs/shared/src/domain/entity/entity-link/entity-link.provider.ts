import { config } from '@shared/config'
import { EntityInstance } from '@shared/domain/entity/domain/entity-instance'
import { EntityType } from '@shared/domain/entity/domain/entity.type'

interface GetLinkOptions {
  absolute?: boolean
}

export abstract class EntityLinkProvider<T extends EntityType> {
  protected abstract getRelativeLink(entity: EntityInstance<T>): Promise<`/${string}`>

  async getLink(
    entity: EntityInstance<T>,
    { absolute = true }: GetLinkOptions = {},
  ): Promise<string> {
    const relativeLink = await this.getRelativeLink(entity)

    if (absolute) {
      return `${config.api.railsHost}${relativeLink}`
    }

    return relativeLink
  }
}
