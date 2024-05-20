import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { AppSeries } from '@shared/domain/app-series/app-series.entity'
import { App } from '@shared/domain/app/app.entity'
import { Job } from '@shared/domain/job/job.entity'
import { Space } from '@shared/domain/space/space.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Node } from '@shared/domain/user-file/node.entity'
import { User } from '@shared/domain/user/user.entity'
import * as errors from '../../../errors'
import { defaultLogger as logger } from '../../../logger'
import { PlatformClient } from '../../../platform-client'
import type { UserCtx } from '../../../types'
import { SCOPE } from '../../../types/common'
import { Comparison, COMPARISON_STATE } from '../../comparison/comparison.entity'
import { createAppPublished } from '../../event/event.helper'
import { getIdFromScopeName } from '../../space/space.helper'
import {
  FILE_STATE_DX,
  FILE_STATE_PFDA,
  FILE_STI_TYPE,
  PARENT_TYPE,
} from '../../user-file/user-file.types'

export interface IPublisherService {
  publishNodes(nodes: Node[], user: User, scope: string): Promise<number>
  publishApps(apps: App[], user: User, scope: string): Promise<number>
  publishComparisons(comparisons: Comparison[], user: User, scope: string): Promise<number>
  publishJobs(jobs: Job[], user: User, scope: string): Promise<number>
  // for now that's all entities we need for discussions.
}
/**
 Publisher service is responsible for publishing entities to the selected scope.
 At the moment, only publishing to PUBLIC scope is supported.
 */

// At the moment the service is only prepared to publishing to public scope.
// Publishing to spaces is not needed because we have a limitation in place where only items
// already existing in the particular space can be added to space discussions (there is no need to publish them in the space).
@Injectable()
export class PublisherService implements IPublisherService {
  private readonly em: SqlEntityManager
  private readonly userCtx: UserCtx
  private readonly platformClient: PlatformClient
  constructor(em: SqlEntityManager, userCtx: UserContext, client: PlatformClient) {
    this.em = em
    this.userCtx = userCtx
    this.platformClient = client
    logger.debug('Publisher service initialized')
  }

  async publishApps(apps: App[], user: User, scope: string): Promise<number> {
    if (scope !== 'public') {
      throw new errors.InvalidStateError(`Unable to publish apps: scope ${scope} is not supported.`)
    }
    let count = 0
    for (const app of apps) {
      const appSeries = await this.em.findOneOrFail(AppSeries, { id: app.appSeriesId })
      // @ts-ignore
      if (!['private', scope].includes(appSeries.scope)) {
        throw new errors.InvalidStateError(`Unable to publish app ${app.uid}: app series ${appSeries.id} and ${app.uid} have different scope.`)
      }
      // authorize users for app
      const authorizedUsers = await this.getAuthorizedUsers(scope)
      await this.platformClient.appAddAuthorizedUsers({ appId: app.uid, authorizedUsers })
      await this.platformClient.appPublish({ appId: app.uid, makeDefault: false })

      app.scope = scope
      appSeries.scope = scope


      if (!appSeries.latestVersionAppId) {
        appSeries.latestVersionAppId = app.id
      } else {
        const latestVersionApp = await this.em.findOneOrFail(App, { id: appSeries.latestVersionAppId })
        if (latestVersionApp.revision < app.revision) {
          appSeries.latestVersionAppId = app.id
        }
      }

      this.em.persist(app)
      this.em.persist(appSeries)
      count++
      const event = await createAppPublished(app, user, scope)
      await this.em.persistAndFlush(event)
    }

    return count
  }

  async publishComparisons(comparisons: Comparison[], user: User, scope: SCOPE): Promise<number> {
    if (scope !== 'public') {
      throw new errors.InvalidStateError(`Unable to publish comparisons: scope ${scope} is not supported.`)
    }
    let count = 0
    const destinationProject = user.publicComparisonsProject

    // let comparisonsToPublish: Comparison[] = []
    const projects: { [key: string]: Node[] } = {}

    for (const comparison of comparisons) {
      if (comparison.state !== COMPARISON_STATE.DONE) {
        throw new errors.InvalidStateError(`Unable to publish comparison with id: ${comparison.id}: comparison is not done.`)
      }

      // TODO Jiri: ideally put this as property of comparison - did not worked well on first try.
      const outputs = await this.em.find(Node, { parentType: PARENT_TYPE.COMPARISON, parentId: comparison.id })

      for (const item of outputs) {
        if (!this.consistencyCheck(item, user)) {
          throw new errors.InvalidStateError(`Unable to publish comparison with id: ${comparison.id}: consistency check failure for ${item.uid}.`)
        }
        if (destinationProject === item.project || item.project == null) {
          throw new errors.InvalidStateError(`Unable to publish comparison with id: ${comparison.id}: source and destination projects collision for ${item.uid}.`)
        }
        if (projects.hasOwnProperty(item.project)) {
          // @ts-ignore fixme: don't know how to avoid ts-ignore here
          projects[item.project].push(item)
        } else {
          // @ts-ignore fixme: don't know how to avoid ts-ignore here
          projects[item.project] = [item]
        }
      }
    }

    for (const [project, files] of Object.entries(projects)) {
      if (files.length === 0) {
        continue
      }
      const filesDxids: string[] = files.map(file => file.dxid!)
      await this.platformClient.cloneObjects({ sourceProject: project, destinationProject, objects: filesDxids })
    }

    for (const comparison of comparisons) {
      await this.em.refresh(comparison)
      // todo: check comparison is still publishable by current user.

      const outputs = await this.em.find(Node, { parentType: PARENT_TYPE.COMPARISON, parentId: comparison.id })
      for (const item of outputs) {
        item.scope = scope
        item.project = destinationProject
        //TODO Jiri: investigate no scopedParent adjustments in ruby - WHY?
      }
      comparison.scope = scope
      this.em.persist(outputs)
      await this.em.persistAndFlush(comparison)
      count++
    }

    for (const [project, files] of Object.entries(projects)) {
      const filesDxids: string[] = files.map(file => file.dxid!)
      await this.platformClient.fileRemove({ projectId: project, ids: filesDxids })
    }

    return count
  }

  async publishJobs(jobs: Job[], user: User, scope: SCOPE): Promise<number> {
    if (scope !== 'public') {
      throw new errors.InvalidStateError(`Unable to publish jobs: scope ${scope} is not supported.`)
    }
    let count = 0

    for (const job of jobs) {
      job.scope = scope
      this.em.persist(job)
      count++
    }
    await this.em.flush()
    return count
  }

  //
  // Publishes selected nodes to PUBLIC scope only.
  // Verifies that the nodes are in publishable state.
  // Clones the nodes to the public project on platform, reflect the changes in the db and remove the nodes from original project.
  //
  async publishNodes(nodes: Node[], user: User, scope: SCOPE): Promise<number> {
    if (scope !== 'public') {
      throw new errors.InvalidStateError(`Unable to publish nodes: scope ${scope} is not supported.`)
    }
    let count = 0
    const destinationProject = user.publicFilesProject
    const projects: { [key: string]: Node[] } = {}

    for (const node of nodes) {
      if (node.stiType === FILE_STI_TYPE.FOLDER) {
        throw new errors.InvalidStateError(`Unable to publish node ${node.id}: folders are not supported.`)
      }
      if (node.state !== FILE_STATE_DX.CLOSED) {
        throw new errors.InvalidStateError(`Unable to publish file ${node.uid}: file is not closed.`)
      }
      if (destinationProject === node.project || node.project == null) {
        throw new errors.InvalidStateError(`Unable to publish file ${node.uid}: source and destination projects collision or is null.`)
      }
      if (projects.hasOwnProperty(node.project)) {
        // @ts-ignore fixme: don't know how to avoid ts-ignore here
        projects[node.project].push(node)
      } else {
        // @ts-ignore fixme: don't know how to avoid ts-ignore here
        projects[node.project] = [node]
      }
    }

    for (const [project, files] of Object.entries(projects)) {
      if (files.length === 0) {
        continue
      }
      const filesDxids: string[] = files.map(file => file.dxid!)
      await this.platformClient.cloneObjects({ sourceProject: project, destinationProject, objects: filesDxids })
      for (const file of files) {
        file.scope = scope
        file.project = destinationProject
        file.scopedParentFolder = undefined
        count++
      }
      await this.em.persistAndFlush(files)
      await this.platformClient.fileRemove({ projectId: project, ids: filesDxids })
    }

    return count
  }

  // Taken from ruby code, not sure if all checks are still needed or relevant.
  private consistencyCheck(node: Node, user: User): boolean {
    if (node.scope === 'private') {
      if (node.parentType !== PARENT_TYPE.COMPARISON) {
        return node.project === user.privateFilesProject
      }
      return node.project === user.privateComparisonsProject
    } else if (node.scope === 'public') {
      return node.project === user.publicFilesProject
    } else if (![FILE_STATE_DX.CLOSED, FILE_STATE_PFDA.COPYING].includes(node.state!)) {
      return false
    }
    return true
  }

  private async getAuthorizedUsers(scope: string) {
    if (scope === 'public') {
      return [config.platform.orgEveryoneHandle]
    }
    const space = await this.em.findOneOrFail(Space, { id: getIdFromScopeName(scope) })
    return [space.hostDxOrg, space.guestDxOrg]
  }
}
