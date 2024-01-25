import { App } from '@shared/domain/app/app.entity'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { Job } from '@shared/domain/job/job.entity'
import { Comment } from '@shared/domain/comment/comment.entity'
import { Note } from '@shared/domain/note/note.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { ENTITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from '../domain/space-event/space-event.enum'
import { AppEntityDataProvider } from './providers/app.provider'
import { AssetEntityDataProvider } from './providers/asset.provider'
import { CommentEntityDataProvider} from './providers/comment.provider'
import { SpaceEventJobEntityDataProvider } from './providers/job.provider'
import { ComparisonEntityDataProvider } from './providers/comparison.provider'
import { UserFileEntityDataProvider } from './providers/user-file.provider'
import { FolderEntityDataProvider } from './providers/folder.provider'
import { WorkflowEntityDataProvider } from './providers/workflow.provider'
import { SpaceEntityDataProvider } from './providers/space.provider'
import { NoteEntityDataProvider } from './providers/note.provider'
import { SpaceMembershipEntityDataProvider } from './providers/space-membership.provider'
import { EntityDataProvider } from './providers/entity-data.provider'
import { UserEntityDataProvider } from './providers/user.provider'

interface NameToDbEntityMap {

  app: App,
  asset: Asset,
  comment: Comment,
  comparison: Comparison,
  job: Job,
  note: Note,
  userFile: UserFile,
  folder: Folder,
  space: Space,
  workflow: Workflow,
  spaceMembership: SpaceMembership,
  user: User,

}

type EntityType = keyof NameToDbEntityMap

interface InputEntity<T extends EntityType> {
  type: T
  value: NameToDbEntityMap[T]
}

type InputEntityUnion = {
  [T in EntityType]: InputEntity<T>
}[EntityType]

// Abstract class designed to retrieve relevant information about a specific entity with two descendents, one for each type of entity

const ENTITY_DATA_PROVIDER_MAP: { [ T in EntityType ]: EntityDataProvider<T> } = {
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

const getEntityType = (entity: InputEntityUnion): ENTITY_TYPE => {
  return ENTITY_DATA_PROVIDER_MAP[entity.type]?.entityType
}

const getObjectType = (entity: InputEntityUnion): SPACE_EVENT_OBJECT_TYPE => {
  return ENTITY_DATA_PROVIDER_MAP[entity.type]?.spaceEventObjectType
}
const getSpaceEventJsonData = <T extends EntityType>(entity: InputEntity<T>): string => {
  return ENTITY_DATA_PROVIDER_MAP[entity.type]?.getSpaceEventJsonData(entity.value)
}

export { NameToDbEntityMap, EntityType, InputEntityUnion, InputEntity, getEntityType, getObjectType, getSpaceEventJsonData }
