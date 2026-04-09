import { App } from '@shared/domain/app/app.entity'
import { Comment } from '@shared/domain/comment/comment.entity'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { Job } from '@shared/domain/job/job.entity'
import { Note } from '@shared/domain/note/note.entity'
import { Space } from '@shared/domain/space/space.entity'
import { EntityTypeWithValueDTO } from '@shared/domain/space-event/dto/entity-type-with-value-dto'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { User } from '@shared/domain/user/user.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { ENTITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from '../domain/space-event/space-event.enum'
import { AppEntityDataProvider } from './providers/app.provider'
import { AssetEntityDataProvider } from './providers/asset.provider'
import { CommentEntityDataProvider } from './providers/comment.provider'
import { ComparisonEntityDataProvider } from './providers/comparison.provider'
import { EntityDataProvider } from './providers/entity-data.provider'
import { FolderEntityDataProvider } from './providers/folder.provider'
import { SpaceEventJobEntityDataProvider } from './providers/job.provider'
import { NoteEntityDataProvider } from './providers/note.provider'
import { SpaceEntityDataProvider } from './providers/space.provider'
import { SpaceMembershipEntityDataProvider } from './providers/space-membership.provider'
import { UserEntityDataProvider } from './providers/user.provider'
import { UserFileEntityDataProvider } from './providers/user-file.provider'
import { WorkflowEntityDataProvider } from './providers/workflow.provider'

export interface NameToDbEntityMap {
  app: App
  asset: Asset
  comment: Comment
  comparison: Comparison
  job: Job
  note: Note
  userFile: UserFile
  folder: Folder
  space: Space
  workflow: Workflow
  spaceMembership: SpaceMembership
  user: User
}

export type EntityType = keyof NameToDbEntityMap

export const ENTITY_TYPE_KEYSET: EntityType[] = [
  'app',
  'asset',
  'comment',
  'comparison',
  'job',
  'note',
  'userFile',
  'folder',
  'space',
  'workflow',
  'spaceMembership',
  'user',
]

export interface InputEntity<T extends EntityType> {
  type: T
  value: NameToDbEntityMap[T]
}

export type InputEntityUnion = {
  [T in EntityType]: InputEntity<T>
}[EntityType]

// Abstract class designed to retrieve relevant information about a specific entity with two descendents, one for each type of entity

export const ENTITY_DATA_PROVIDER_MAP: { [T in EntityType]: EntityDataProvider<T> } = {
  app: new AppEntityDataProvider(),
  asset: new AssetEntityDataProvider(),
  comment: new CommentEntityDataProvider(),
  comparison: new ComparisonEntityDataProvider(),
  job: new SpaceEventJobEntityDataProvider(),
  note: new NoteEntityDataProvider(),
  userFile: new UserFileEntityDataProvider(),
  folder: new FolderEntityDataProvider(),
  space: new SpaceEntityDataProvider(),
  workflow: new WorkflowEntityDataProvider(),
  spaceMembership: new SpaceMembershipEntityDataProvider(),
  user: new UserEntityDataProvider(),
}

export const getEntityType = (entity: EntityTypeWithValueDTO): ENTITY_TYPE => {
  return ENTITY_DATA_PROVIDER_MAP[entity.type]?.entityType
}

export const getObjectType = (entity: EntityTypeWithValueDTO): SPACE_EVENT_OBJECT_TYPE => {
  return ENTITY_DATA_PROVIDER_MAP[entity.type]?.spaceEventObjectType
}
