import { App } from '@shared/domain/app/app.entity'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { Job } from '@shared/domain/job/job.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'

export const entityTypeToEntityMap = {
  asset: Asset,
  comparison: Comparison,
  job: Job,
  file: UserFile,
  user: User,
  app: App,
  workflow: Workflow,
  discussion: Discussion,
} satisfies Record<EntityType, object>
