import { isNil } from "ramda"
import { PlatformClient } from "../../../platform-client"
import { CheckStatusJob } from "../../../queue/task.input"
import { Maybe, UserOpsCtx } from "../../../types"
import { WorkerBaseOperation } from "../../../utils/base-operation"
import { removeRepeatable } from '../../../queue'
import { Job } from "../../job"
import { Tag } from "../../tag/tag.entity"
import { Folder } from "../folder.entity"
import { assignTags } from "../user-file-tags"
import { FILE_ORIGIN_TYPE, PARENT_TYPE } from "../user-file.enum"
import { SyncFilesInFolderOperation, SyncFolderFilesOutput } from "./sync-folder-files"
import { SyncFoldersOperation } from "./sync-folders"


/*
 * WorkstationSyncFilesOperation syncs completely syncs files in a user's dx project
 *   associated with a workstation. Note that this operation doesn't apply to
 *   normal jobs, whose output files are well defined and are only synchronised when
 *   the app finishes successfully.
 */
export class WorkstationSyncFilesOperation extends WorkerBaseOperation<
  UserOpsCtx,
  CheckStatusJob['payload'],
  Maybe<Job>
> {
  async run(input: CheckStatusJob['payload']): Promise<Maybe<Job>> {
    const em = this.ctx.em
    const jobRepo = em.getRepository(Job)
    const job = await jobRepo.findOne({ dxid: input.dxid })
    const client = new PlatformClient(this.ctx.log)
    if (!job) {
      this.ctx.log.warn({ input }, 'Job does not exist')
      await removeRepeatable(this.ctx.job)
      return
    }

    this.ctx.log.info({ jobId: job.id }, 'WorkstationSyncFilesOperation: Beginning files sync for job')

    const projectDesc = await client.foldersList({
      projectId: job.project,
      accessToken: this.ctx.user.accessToken,
    })
    const syncFoldersOp = new SyncFoldersOperation({
      log: this.ctx.log,
      em: this.ctx.em,
      user: this.ctx.user,
    })
    const localFolders = await syncFoldersOp.execute({
      remoteFolderPaths: projectDesc.folders,
      scope: job.scope,
      parentId: job.id,
      parentType: PARENT_TYPE.JOB,
      projectDxid: job.project,
    })

    // for each local folder query files and check for differences
    // null is added -> root folder
    const folderPathsToCheck: Array<Folder | null> = [null, ...localFolders]
    this.ctx.log.info({
      foldersToCheckCount: folderPathsToCheck.length,
    }, 'WorkstationSyncFilesOperation: About to sync files in folders')

    const fileDeletesSeq = async (): Promise<void> => {
      for (const folder of folderPathsToCheck) {
        // !!!
        const syncFilesEm = this.ctx.em.fork(true)
        const syncFilesInFolderOp = new SyncFilesInFolderOperation({
          log: this.ctx.log,
          // operations run in parallel, they should have their own DB context
          em: syncFilesEm,
          user: this.ctx.user,
        })
        // eslint-disable-next-line no-await-in-loop
        await syncFilesInFolderOp.execute({
          folderId: !isNil(folder) ? folder.id : null,
          projectDxid: job.project,
          scope: job.scope,
          parentType: PARENT_TYPE.JOB,
          parentId: job.id,
          entityType: FILE_ORIGIN_TYPE.HTTPS,
          runRemove: true,
          runAdd: false,
        })
      }
    }
    const syncFilesResp: SyncFolderFilesOutput[] = []
    await fileDeletesSeq()

    const fileAddsSeq = async (): Promise<void> => {
      for (const folder of folderPathsToCheck) {
        // !!!
        const syncFilesEm = this.ctx.em.fork(true)
        const syncFilesInFolderOp = new SyncFilesInFolderOperation({
          log: this.ctx.log,
          // operations run in parallel, they should have their own DB context
          em: syncFilesEm,
          user: this.ctx.user,
        })
        // eslint-disable-next-line no-await-in-loop
        const res = await syncFilesInFolderOp.execute({
          folderId: !isNil(folder) ? folder.id : null,
          projectDxid: job.project,
          scope: job.scope,
          parentType: PARENT_TYPE.JOB,
          parentId: job.id,
          entityType: FILE_ORIGIN_TYPE.HTTPS,
          runRemove: false,
          runAdd: true,
        })
        syncFilesResp.push(res)
      }
    }
    await fileAddsSeq()

    const httpsFilesTag = await em.getRepository(Tag).findOneOrCreate('HTTPS File')
    const jupyterSnapshotTag = await em.getRepository(Tag).findOneOrCreate('Jupyter Snapshot')
    const createdFolderTags = await assignTags(this.ctx, localFolders, httpsFilesTag)
    httpsFilesTag.taggingCount += createdFolderTags
    await Promise.all(
      syncFilesResp.map(async ({ folderPath, files }) => {
        // files were created in a different identity map
        em.persist(files)
        // extra action based on folderPath happens here
        if (folderPath.includes('/.Notebook_snapshots')) {
          const newSnapshotTagsCnt = await assignTags(this.ctx, files, jupyterSnapshotTag)
          jupyterSnapshotTag.taggingCount += newSnapshotTagsCnt
          // this.changeEntityType(files)
        }
        // all files get this for now
        const newHttpsTagsCnt = await assignTags(this.ctx, files, httpsFilesTag)
        httpsFilesTag.taggingCount += newHttpsTagsCnt
      }),
    )
    await em.flush()

    this.ctx.log.info({ jobId: job.id }, 'WorkstationSyncFilesOperation: Completed sync')
  }
}
