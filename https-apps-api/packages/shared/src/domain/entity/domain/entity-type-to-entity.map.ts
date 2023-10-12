import { App } from '../../app'
import { Comparison } from '../../comparison'
import { Job } from '../../job'
import { User } from '../../user'
import { Asset, UserFile } from '../../user-file'
import { EntityType } from '..'

export const entityTypeToEntityMap = {
  asset: Asset,
  comparison: Comparison,
  job: Job,
  file: UserFile,
  user: User,
  app: App,
} satisfies Record<EntityType, object>
