import { wrap } from '@mikro-orm/core'
import { App } from '@shared/domain/app/app.entity'
import { Job } from '@shared/domain/job/job.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { User } from '@shared/domain/user/user.entity'
import { JobDescribeResponse } from '@shared/platform-client/platform-client.responses'
import { IFileOrAsset } from '../user-file/user-file.types'
import { Event } from './event.entity'

const EVENT_TYPES = {
  FOLDER_CREATED: 'Event::FolderCreated',
  FOLDER_DELETED: 'Event::FolderDeleted',
  JOB_CLOSED: 'Event::JobClosed',
  JOB_ADDED: 'Event::JobAdded',
  FOLDER_LOCKED: 'Event::FolderLocked',
  FOLDER_UNLOCKED: 'Event::FolderUnlocked',
  FILE_ABANDONED: 'Event::FileAbandoned',
  FILE_DELETED: 'Event::FileDeleted',
  FILE_BULK_DOWNLOAD: 'Event::FileBulkDownload',
  FILE_LOCKED: 'Event::FileLocked',
  FILE_UNLOCKED: 'Event::FileUnlocked',
  APP_CREATED: 'Event::AppCreated',
  APP_PUBLISHED: 'Event::AppPublished',
  FILE_CREATED: 'Event::FileCreated',
}

const createAppCreated = async (user: User, app: App): Promise<Event> => {
  const event = new Event()
  const organization = user.organization.isInitialized()
    ? user.organization.getEntity()
    : await user.organization.load()
  wrap(event).assign({
    type: EVENT_TYPES.APP_CREATED,
    orgHandle: organization.handle,
    dxuser: user.dxuser,
    param1: app.dxid,
    param2: app.title,
  })
  return event
}

const createAppPublished = async (app: App, user: User, scope: string): Promise<Event> => {
  const event = new Event()
  const organization = user.organization.isInitialized()
    ? user.organization.getEntity()
    : await user.organization.load()
  wrap(event).assign({
    type: EVENT_TYPES.APP_PUBLISHED,
    orgHandle: organization.handle,
    dxuser: user.dxuser,
    param1: app.dxid,
    param2: scope,
  })
  return event
}

const createJobClosed = async (user: User, job: Job, platformJobData: JobDescribeResponse): Promise<Event> => {
  const event = new Event()
  const app = job.app
    ? job.app.isInitialized() ? job.app.getEntity() : await job.app.load()
    : undefined
  const organization = await user.organization.load()
  wrap(event).assign({
    type: EVENT_TYPES.JOB_CLOSED,
    orgHandle: organization.handle,
    dxuser: user.dxuser,
    param1: job.dxid,
    param2: app?.dxid,
    param3: platformJobData.totalPrice?.toString(),
  })
  return event
}

const createFolderEvent = async (eventType: string, folder: Folder, folderPath: string, user: User): Promise<Event> => {
  const event = new Event()
  const organization = user.organization.isInitialized()
    ? user.organization.getEntity()
    : await user.organization.load()
  const data = JSON.stringify({
    id: folder.id,
    scope: folder.scope,
    name: folder.name,
    path: folderPath,
  })
  wrap(event).assign({
    type: eventType,
    orgHandle: organization.handle,
    dxuser: user.dxuser,
    param1: folderPath,
    data,
  })
  return event
}

const createFileEvent = async (
  eventType: string,
  file: IFileOrAsset,
  filePath: string,
  user: User,
  param3?: string,
): Promise<Event> => {
  const event = new Event()
  const organization = user.organization.isInitialized()
    ? user.organization.getEntity()
    : await user.organization.load()
  const data = JSON.stringify({
    id: file.id,
    scope: file.scope,
    name: file.name,
    path: filePath,
  })
  wrap(event).assign({
    type: eventType,
    orgHandle: organization.handle,
    dxuser: user.dxuser,
    param1: file.fileSize ? file.fileSize.toString() : '0',
    param2: file.dxid,
    param3,
    data,
  })
  return event
}

export {
  EVENT_TYPES,
  createJobClosed,
  createFolderEvent,
  createFileEvent,
  createAppCreated,
  createAppPublished,
}
