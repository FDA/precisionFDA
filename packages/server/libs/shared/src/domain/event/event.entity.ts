import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

export enum EVENT_TYPES {
  FOLDER_CREATED = 'Event::FolderCreated',
  FOLDER_DELETED = 'Event::FolderDeleted',
  JOB_CLOSED = 'Event::JobClosed',
  JOB_ADDED = 'Event::JobAdded',
  FOLDER_LOCKED = 'Event::FolderLocked',
  FOLDER_UNLOCKED = 'Event::FolderUnlocked',
  FILE_ABANDONED = 'Event::FileAbandoned',
  FILE_DELETED = 'Event::FileDeleted',
  FILE_COPIED = 'Event::FileCopied',
  FILE_BULK_DOWNLOAD = 'Event::FileBulkDownload',
  FILE_LOCKED = 'Event::FileLocked',
  FILE_UNLOCKED = 'Event::FileUnlocked',
  APP_CREATED = 'Event::AppCreated',
  APP_PUBLISHED = 'Event::AppPublished',
  FILE_CREATED = 'Event::FileCreated',
  DBCLUSTER_PASSWORD_ROTATED = 'Event::DbClusterPasswordRotated',
  SPACE_DELETED = 'Event::SpaceDeleted',
}

@Entity({ tableName: 'events' })
export class Event {
  @PrimaryKey()
  id: number

  @Property()
  type: EVENT_TYPES

  @Property()
  orgHandle: string

  @Property()
  dxuser: string

  // dxid
  @Property({ nullable: true })
  param1: string

  // app_dxid
  @Property({ nullable: true })
  param2: string

  @Property({ nullable: true })
  param3: string

  @Property({ nullable: true })
  param4: string

  @Property({ nullable: true })
  data: string

  @Property()
  createdAt = new Date()
}
