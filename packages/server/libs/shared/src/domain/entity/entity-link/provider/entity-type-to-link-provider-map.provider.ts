import { Provider } from '@nestjs/common'
import { ComparisonEntityLinkProvider } from '@shared/domain/entity/entity-link/comparison-entity-link.provider'
import { DBClusterEntityLinkProvider } from '@shared/domain/entity/entity-link/dbcluster-entity-link.provider'
import { DiscussionEntityLinkProvider } from '@shared/domain/entity/entity-link/discussion-entity-link.provider'
import { UiLinkableEntityType } from '@shared/domain/entity/entity-link/domain/ui-linkable-entity.type'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'
import { FolderEntityLinkProvider } from '@shared/domain/entity/entity-link/folder-entity-link.provider'
import { NoteEntityLinkProvider } from '@shared/domain/entity/entity-link/note-entity-link.provider'
import { UIdScopedEntityLinkProvider } from '@shared/domain/entity/entity-link/u-id-scoped-entity-link-provider'
import { UserEntityLinkProvider } from '@shared/domain/entity/entity-link/user-entity-link.provider'

export const ENTITY_TYPE_TO_LINK_PROVIDER_MAP = 'ENTITY_TYPE_TO_LINK_PROVIDER_MAP'

export const entityTypeToLinkProviderMapProvider: Provider = {
  provide: ENTITY_TYPE_TO_LINK_PROVIDER_MAP,
  inject: [
    UIdScopedEntityLinkProvider,
    UserEntityLinkProvider,
    ComparisonEntityLinkProvider,
    DBClusterEntityLinkProvider,
    DiscussionEntityLinkProvider,
    FolderEntityLinkProvider,
    NoteEntityLinkProvider,
  ],
  useFactory: (
    uidScoped: UIdScopedEntityLinkProvider,
    user: UserEntityLinkProvider,
    comparison: ComparisonEntityLinkProvider,
    dbcluster: DBClusterEntityLinkProvider,
    discussion: DiscussionEntityLinkProvider,
    folder: FolderEntityLinkProvider,
    note: NoteEntityLinkProvider,
  ): { [T in UiLinkableEntityType]: EntityLinkProvider<T> } => {
    return {
      user,
      comparison,
      discussion,
      folder,
      note,
      dbcluster,
      file: uidScoped,
      app: uidScoped,
      job: uidScoped,
      asset: uidScoped,
      workflow: uidScoped,
    }
  },
}
