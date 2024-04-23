import { Module } from '@nestjs/common'
import { ComparisonEntityLinkProvider } from '@shared/domain/entity/entity-link/comparison-entity-link.provider'
import { DiscussionEntityLinkProvider } from '@shared/domain/entity/entity-link/discussion-entity-link.provider'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'
import { entityTypeToLinkProviderMapProvider } from '@shared/domain/entity/entity-link/provider/entity-type-to-link-provider-map.provider'
import { ResourceEntityLinkProvider } from '@shared/domain/entity/entity-link/resource-entity-link.provider'
import { UIdScopedEntityLinkProvider } from '@shared/domain/entity/entity-link/u-id-scoped-entity-link-provider'
import { UserEntityLinkProvider } from '@shared/domain/entity/entity-link/user-entity-link.provider'

@Module({
  providers: [
    UIdScopedEntityLinkProvider,
    UserEntityLinkProvider,
    ComparisonEntityLinkProvider,
    DiscussionEntityLinkProvider,
    ResourceEntityLinkProvider,
    entityTypeToLinkProviderMapProvider,
    EntityLinkService,
  ],
  exports: [EntityLinkService],
})
export class EntityLinkModule {}
