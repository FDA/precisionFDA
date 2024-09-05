import { Module } from '@nestjs/common'
import { ComparisonEntityLinkProvider } from '@shared/domain/entity/entity-link/comparison-entity-link.provider'
import { DBClusterEntityLinkProvider } from '@shared/domain/entity/entity-link/dbcluster-entity-link.provider'
import { DiscussionEntityLinkProvider } from '@shared/domain/entity/entity-link/discussion-entity-link.provider'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'
import { FolderEntityLinkProvider } from '@shared/domain/entity/entity-link/folder-entity-link.provider'
import { NoteEntityLinkProvider } from '@shared/domain/entity/entity-link/note-entity-link.provider'
import { entityTypeToLinkProviderMapProvider } from '@shared/domain/entity/entity-link/provider/entity-type-to-link-provider-map.provider'
import { UIdScopedEntityLinkProvider } from '@shared/domain/entity/entity-link/u-id-scoped-entity-link-provider'
import { UserEntityLinkProvider } from '@shared/domain/entity/entity-link/user-entity-link.provider'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'

@Module({
  imports: [PlatformClientModule],
  providers: [
    UIdScopedEntityLinkProvider,
    UserEntityLinkProvider,
    ComparisonEntityLinkProvider,
    DBClusterEntityLinkProvider,
    DiscussionEntityLinkProvider,
    FolderEntityLinkProvider,
    NoteEntityLinkProvider,
    entityTypeToLinkProviderMapProvider,
    EntityLinkService,
  ],
  exports: [EntityLinkService],
})
export class EntityLinkModule {}
