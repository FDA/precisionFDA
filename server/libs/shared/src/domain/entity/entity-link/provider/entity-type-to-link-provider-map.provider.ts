import { Provider } from '@nestjs/common'
import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { ComparisonEntityLinkProvider } from '@shared/domain/entity/entity-link/comparison-entity-link.provider'
import { DiscussionEntityLinkProvider } from '@shared/domain/entity/entity-link/discussion-entity-link.provider'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'
import { ResourceEntityLinkProvider } from '@shared/domain/entity/entity-link/resource-entity-link.provider'
import { UIdScopedEntityLinkProvider } from '@shared/domain/entity/entity-link/u-id-scoped-entity-link-provider'
import { UserEntityLinkProvider } from '@shared/domain/entity/entity-link/user-entity-link.provider'

export const ENTITY_TYPE_TO_LINK_PROVIDER_MAP = 'ENTITY_TYPE_TO_LINK_PROVIDER_MAP'

export const entityTypeToLinkProviderMapProvider: Provider = {
  provide: ENTITY_TYPE_TO_LINK_PROVIDER_MAP,
  inject: [
    UIdScopedEntityLinkProvider,
    UserEntityLinkProvider,
    ComparisonEntityLinkProvider,
    DiscussionEntityLinkProvider,
    ResourceEntityLinkProvider,
  ],
  useFactory: (
    uidScoped: UIdScopedEntityLinkProvider,
    user: UserEntityLinkProvider,
    comparison: ComparisonEntityLinkProvider,
    discussion: DiscussionEntityLinkProvider,
    resource: ResourceEntityLinkProvider,
  ): { [T in EntityType]: EntityLinkProvider<T> } => {
    return {
      user,
      comparison,
      discussion,
      resource,
      file: uidScoped,
      app: uidScoped,
      job: uidScoped,
      asset: uidScoped,
      workflow: uidScoped,
    }
  },
}
