import { App } from '@shared/domain/app/app.entity'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { ExpertAnswer } from '@shared/domain/expert-answer/entity/expert-answer.entity'
import { ExpertQuestion } from '@shared/domain/expert-question/entity/expert-question.entity'
import { Expert } from '@shared/domain/expert/entity/expert.entity'
import { Job } from '@shared/domain/job/job.entity'
import { Resource } from '@shared/domain/resource/resource.entity'
import { Note } from '@shared/domain/note/note.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { Answer } from '@shared/domain/answer/answer.entity'
import { Comment } from '@shared/domain/comment/comment.entity'

export const entityTypeToEntityMap = {
  asset: Asset,
  comparison: Comparison,
  job: Job,
  file: UserFile,
  folder: Folder,
  user: User,
  app: App,
  workflow: Workflow,
  discussion: Discussion,
  resource: Resource,
  note: Note,
  dbcluster: DbCluster,
  answer: Answer,
  comment: Comment,
  challenge: Challenge,
  expertQuestion: ExpertQuestion,
  expertAnswer: ExpertAnswer,
  expert: Expert,
} satisfies Record<EntityType, object>
