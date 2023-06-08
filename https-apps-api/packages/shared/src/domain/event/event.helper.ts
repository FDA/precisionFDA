import { wrap } from '@mikro-orm/core'
import { Job } from '../job'
import { User } from '../user'
import { Folder } from '../user-file/folder.entity'
import { UserFile } from '../user-file/user-file.entity'
import { Event } from './event.entity'

const createJobClosed = async (user: User, job: Job): Promise<Event> => {
  const event = new Event()
  const app = job.app
    ? job.app.isInitialized() ? job.app.getEntity() : await job.app.load()
    : undefined
  const organization = user.organization.isInitialized()
    ? user.organization.getEntity()
    : await user.organization.load()
  wrap(event).assign({
    type: EVENT_TYPES.JOB_CLOSED,
    orgHandle: organization.handle,
    dxuser: user.dxuser,
    param1: job.dxid,
    param2: app?.dxid,
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
  file: UserFile,
  filePath: string,
  user: User,
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
    param1: filePath,
    param2: file.dxid,
    data,
  })
  return event
}

const EVENT_TYPES = {
  FOLDER_CREATED: 'Event::FolderCreated',
  FOLDER_DELETED: 'Event::FolderDeleted',
  JOB_CLOSED: 'Event::JobClosed',
  FOLDER_LOCKED: 'Event::FolderLocked',
  FOLDER_UNLOCKED: 'Event::FolderUnlocked',
  FILE_LOCKED: 'Event::FileLocked',
  FILE_UNLOCKED: 'Event::FileUnlocked',
}

export { EVENT_TYPES, createJobClosed, createFolderEvent, createFileEvent }
