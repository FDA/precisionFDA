import {
  App,
  Asset,
  Comment,
  Comparison,
  Folder,
  Job,
  Note,
  Space, SpaceMembership,
  UserFile,
  Workflow
} from '../domain'
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
