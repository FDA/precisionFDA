import { Module } from '@nestjs/common'
import { AnswerEntityLinkProvider } from '@shared/domain/entity/entity-link/answer-entity-link.provider'
import { ChallengeEntityLinkProvider } from '@shared/domain/entity/entity-link/challenge-entity-link.provider'
import { CommentEntityLinkProvider } from '@shared/domain/entity/entity-link/comment-entity-link.provider'
import { ComparisonEntityLinkProvider } from '@shared/domain/entity/entity-link/comparison-entity-link.provider'
import { DBClusterEntityLinkProvider } from '@shared/domain/entity/entity-link/dbcluster-entity-link.provider'
import { DiscussionEntityLinkProvider } from '@shared/domain/entity/entity-link/discussion-entity-link.provider'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'
import { ExpertAnswerEntityLinkProvider } from '@shared/domain/entity/entity-link/expert-answer-entity-link.provider'
import { ExpertEntityLinkProvider } from '@shared/domain/entity/entity-link/expert-entity-link.provider'
import { ExpertQuestionEntityLinkProvider } from '@shared/domain/entity/entity-link/expert-question-entity-link.provider'
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
    AnswerEntityLinkProvider,
    CommentEntityLinkProvider,
    ChallengeEntityLinkProvider,
    ExpertEntityLinkProvider,
    ExpertAnswerEntityLinkProvider,
    ExpertQuestionEntityLinkProvider,
    entityTypeToLinkProviderMapProvider,
    EntityLinkService,
  ],
  exports: [EntityLinkService],
})
export class EntityLinkModule {}
