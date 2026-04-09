import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { App } from '@shared/domain/app/app.entity'
import { AppSeries } from '@shared/domain/app-series/app-series.entity'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Job } from '@shared/domain/job/job.entity'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { PlatformClient } from '@shared/platform-client'
import { EntityScope } from '@shared/types/common'
import * as errors from '../../../errors'
import { COMPARISON_STATE, Comparison } from '../../comparison/comparison.entity'
import { createAppPublished } from '../../event/event.helper'
import {
  FILE_STATE_DX,
  FILE_STATE_PFDA,
  FILE_STI_TYPE,
  FileOrAsset,
  PARENT_TYPE,
} from '../../user-file/user-file.types'

/**
 Publisher service is responsible for publishing entities to the public scope.
  It handles publishing of apps, comparisons, jobs, and nodes (files, assets and folders).
 Permissions checks are performed before publishing.
 */
@Injectable()
export class PublisherService {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly userContext: UserContext,
    private readonly client: PlatformClient,
  ) {}

  async publishApps(apps: App[], scope: EntityScope): Promise<number> {
    if (scope !== STATIC_SCOPE.PUBLIC) {
      throw new errors.InvalidStateError(`Unable to publish apps: scope ${scope} is not supported.`)
    }
    let count = 0
    for (const app of apps) {
      const appSeries = await this.em.findOneOrFail(AppSeries, { id: app.appSeriesId })
      if (!['private', scope].includes(appSeries.scope)) {
        throw new errors.InvalidStateError(
          `Unable to publish app ${app.uid}: app series ${appSeries.id} and ${app.uid} have different scope.`,
        )
      }
      // authorize users for app
      const authorizedUsers = await this.getAuthorizedUsers()
      await this.client.appAddAuthorizedUsers({ appId: app.uid, authorizedUsers })
      await this.client.appPublish({ appId: app.uid, makeDefault: false })

      app.scope = scope
      appSeries.scope = scope

      if (!appSeries.latestVersionAppId) {
        appSeries.latestVersionAppId = app.id
      } else {
        const latestVersionApp = await this.em.findOneOrFail(App, {
          id: appSeries.latestVersionAppId,
        })
        if (latestVersionApp.revision < app.revision) {
          appSeries.latestVersionAppId = app.id
        }
      }

      this.em.persist(app)
      this.em.persist(appSeries)
      count++
      const user = await this.userContext.loadEntity()
      const event = await createAppPublished(app, user, scope)
      await this.em.persistAndFlush(event)
    }

    return count
  }

  async publishComparisons(comparisons: Comparison[], scope: EntityScope): Promise<number> {
    if (scope !== STATIC_SCOPE.PUBLIC) {
      throw new errors.InvalidStateError(`Unable to publish comparisons: scope ${scope} is not supported.`)
    }
    const user = await this.userContext.loadEntity()
    let count = 0
    const destinationProject = user.publicComparisonsProject

    // let comparisonsToPublish: Comparison[] = []
    const projects: { [key: string]: FileOrAsset[] } = {}

    for (const comparison of comparisons) {
      if (comparison.state !== COMPARISON_STATE.DONE) {
        throw new errors.InvalidStateError(
          `Unable to publish comparison with id: ${comparison.id}: comparison is not done.`,
        )
      }

      // TODO Jiri: ideally put this as property of comparison - did not worked well on first try.
      const outputs = await this.em.find(Node, {
        parentType: PARENT_TYPE.COMPARISON,
        parentId: comparison.id,
      })

      for (const item of outputs) {
        if (!this.consistencyCheck(item, user)) {
          throw new errors.InvalidStateError(
            `Unable to publish comparison with id: ${comparison.id}: consistency check failure for ${item.uid}.`,
          )
        }
        if (destinationProject === item.project || item.project == null) {
          throw new errors.InvalidStateError(
            `Unable to publish comparison with id: ${comparison.id}: source and destination projects collision for ${item.uid}.`,
          )
        }
        // biome-ignore lint/suspicious/noPrototypeBuiltins: Fix after migrating to ES2022 or later
        if (projects.hasOwnProperty(item.project)) {
          projects[item.project].push(item as FileOrAsset)
        } else {
          projects[item.project] = [item as FileOrAsset]
        }
      }
    }

    for (const [project, files] of Object.entries(projects)) {
      if (files.length === 0) {
        continue
      }
      const filesDxids: string[] = files.map(file => file.dxid)
      await this.client.cloneObjects({
        sourceProject: project,
        destinationProject,
        objects: filesDxids,
      })
    }

    for (const comparison of comparisons) {
      await this.em.refresh(comparison)
      // todo: check comparison is still publishable by current user.

      const outputs = await this.em.find(Node, {
        parentType: PARENT_TYPE.COMPARISON,
        parentId: comparison.id,
      })
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
      const filesDxids: string[] = files.map(file => file.dxid)
      await this.client.fileRemove({ projectId: project, ids: filesDxids })
    }

    return count
  }

  async publishJobs(jobs: Job[], scope: EntityScope): Promise<number> {
    if (scope !== STATIC_SCOPE.PUBLIC) {
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

  // Publishes selected nodes to PUBLIC scope only.
  // Verifies that the nodes are in publishable state.
  // Clones the nodes to the public project on platform, reflect the changes in the db and remove the nodes from original project.
  // Note: all nodes in argument must have parentFolder set to null to appear in root public folder.
  async publishNodes(nodes: Node[]): Promise<number> {
    const user = await this.userContext.loadEntity()
    const sourceProject = user.privateFilesProject
    const destinationProject = user.publicFilesProject
    const fileDxids: DxId<'file'>[] = []
    const allNodesToProcess: Node[] = []

    nodes.forEach(node => (node.parentFolder = null))

    // make a copy to avoid side effects
    const nodesToProcess = [...nodes]

    while (nodesToProcess.length > 0) {
      const node = nodesToProcess.shift()
      allNodesToProcess.push(node)

      if (node.stiType === FILE_STI_TYPE.FOLDER) {
        const folder = node as Folder

        // Validate folder can be published
        if (folder.scope !== STATIC_SCOPE.PRIVATE) {
          throw new errors.InvalidStateError(`Unable to publish folder ${folder.uid}: must be your private folder.`)
        }

        // Add all children to processing queue
        const children = await folder.children.load()
        nodesToProcess.push(...children)
      } else {
        // Type assertion since we know it's not a folder
        const file = node as UserFile | Asset
        // Validate file can be published
        if (file.state !== FILE_STATE_DX.CLOSED) {
          throw new errors.InvalidStateError(`Unable to publish file ${file.uid}: file is not closed.`)
        }

        if (file.scope !== STATIC_SCOPE.PRIVATE) {
          throw new errors.InvalidStateError(`Unable to publish file ${file.uid}: must be your private file.`)
        }

        if (destinationProject === file.project || file.project == null) {
          throw new errors.InvalidStateError(
            `Unable to publish file ${file.uid}: source and destination projects collision or is null.`,
          )
        }

        if (file.dxid) {
          fileDxids.push(file.dxid)
        }
      }
    }

    // Clone and remove files if any exist
    if (fileDxids.length > 0) {
      await this.client.cloneObjects({
        sourceProject,
        destinationProject,
        objects: fileDxids,
      })

      await this.client.fileRemove({ projectId: sourceProject, ids: fileDxids })
    }

    const nodeIds = allNodesToProcess.map(node => node.id)
    const fileIds = allNodesToProcess.filter(node => node.stiType !== FILE_STI_TYPE.FOLDER).map(node => node.id)

    await this.em.nativeUpdate(Node, { id: { $in: nodeIds } }, { scope: STATIC_SCOPE.PUBLIC })
    if (fileIds.length > 0) {
      await this.em.nativeUpdate(Node, { id: { $in: fileIds } }, { project: destinationProject })
    }
    return allNodesToProcess.length
  }

  // THIS WILL BE LIKELY REMOVED SOON AS WE ARE DEPRECATING COMPARISONS.
  private consistencyCheck(node: Node, user: User): boolean {
    // Handle private scope nodes
    if (node.scope === STATIC_SCOPE.PRIVATE) {
      const expectedProject =
        node.parentType === PARENT_TYPE.COMPARISON ? user.privateComparisonsProject : user.privateFilesProject
      return node.project === expectedProject
    }

    // Handle public scope nodes
    if (node.scope === STATIC_SCOPE.PUBLIC) {
      return node.project === user.publicFilesProject
    }

    // Handle nodes with other scopes - check state restrictions
    return node.state != null && ![FILE_STATE_DX.CLOSED, FILE_STATE_PFDA.COPYING].includes(node.state)
  }

  private async getAuthorizedUsers(): Promise<string[]> {
    return [config.platform.orgEveryoneHandle]
  }
}
