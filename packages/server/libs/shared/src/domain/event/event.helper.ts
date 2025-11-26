import { EntityManager, wrap } from '@mikro-orm/core'
import { App } from '@shared/domain/app/app.entity'
import { Job } from '@shared/domain/job/job.entity'
import { User } from '@shared/domain/user/user.entity'
import { JobDescribeResponse } from '@shared/platform-client/platform-client.responses'
import { Event, EVENT_TYPES } from './event.entity'
import { DbCluster } from '../db-cluster/db-cluster.entity'
import { FileOrAsset } from '@shared/domain/user-file/user-file.types'
import { Injectable, Logger } from '@nestjs/common'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { Space } from '@shared/domain/space/space.entity'

@Injectable()
export class EventHelper {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(private readonly em: EntityManager) {}

  async createAndPersistDeleteSpaceEvent(user: User, space: Space): Promise<Event> {
    this.logger.log(`Creating SPACE_DELETED event for space ID ${space.id} and user ${user.dxuser}`)
    const event = new Event()
    const organization = user.organization.isInitialized()
      ? user.organization.getEntity()
      : await user.organization.load()
    wrap(event).assign({
      type: EVENT_TYPES.SPACE_DELETED,
      orgHandle: organization.handle,
      dxuser: user.dxuser,
      param1: space.id.toString(),
      param2: space.name,
    })
    await this.em.persistAndFlush(event)
    return event
  }

  async createFileEvent(
    eventType: EVENT_TYPES,
    file: FileOrAsset,
    filePath: string,
    user: User,
    param3?: string,
  ): Promise<Event> {
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

  async createFolderEvent(
    eventType: EVENT_TYPES,
    folder: Folder,
    folderPath: string,
    user: User,
  ): Promise<Event> {
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
}

// standalone functions, should be refactored into the component above

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

const createDbClusterPasswordRotated = async (user: User, dbCluster: DbCluster): Promise<Event> => {
  const event = new Event()
  const organization = user.organization.isInitialized()
    ? user.organization.getEntity()
    : await user.organization.load()
  wrap(event).assign({
    type: EVENT_TYPES.DBCLUSTER_PASSWORD_ROTATED,
    orgHandle: organization.handle,
    dxuser: user.dxuser,
    param1: dbCluster.uid,
    param2: dbCluster.scope,
  })
  return event
}

const createJobClosed = async (
  user: User,
  job: Job,
  platformJobData: JobDescribeResponse,
): Promise<Event> => {
  const event = new Event()
  const app = job.app
    ? job.app.isInitialized()
      ? job.app.getEntity()
      : await job.app.load()
    : undefined
  const organization = await user.organization?.load()
  wrap(event).assign({
    type: EVENT_TYPES.JOB_CLOSED,
    orgHandle: organization ? organization.handle : 'no-org',
    dxuser: user.dxuser,
    param1: job.dxid,
    param2: app?.dxid,
    param3: platformJobData.totalPrice?.toString(),
  })
  return event
}

export { createJobClosed, createAppCreated, createAppPublished, createDbClusterPasswordRotated }
