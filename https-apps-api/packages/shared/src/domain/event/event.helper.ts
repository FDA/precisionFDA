import { wrap } from '@mikro-orm/core'
import { Job } from '../job'
import { User } from '../user'
import { Folder } from '../user-file/folder.entity'
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

const createFolderEvent = async (eventType: string, folder: Folder, folderPath:string, user: User): Promise<Event> => {
  const event = new Event()
  const organization = user.organization.isInitialized()
    ? user.organization.getEntity()
    : await user.organization.load()
  let data = JSON.stringify({
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
    data: data,
  })
  return event
}

const EVENT_TYPES = {
  FOLDER_CREATED: 'Event::FolderCreated',
  FOLDER_DELETED: 'Event::FolderDeleted',
  JOB_CLOSED: 'Event::JobClosed',
}

export { EVENT_TYPES, createJobClosed, createFolderEvent }
