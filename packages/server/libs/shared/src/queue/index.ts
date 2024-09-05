import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { FileSyncQueueJobProducer } from '@shared/domain/user-file/producer/file-sync-queue-job.producer'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { MaintenanceQueueJobProducer } from '@shared/queue/producer/maintenance-queue-job.producer'
import { QueueProxy } from '@shared/queue/queue.proxy'
import Bull, { Job, JobInformation, Queue } from 'bull'
import { config } from '../config'
import {
  FileUidInput,
  SyncFileJobInput,
  UidAndFollowUpInput,
} from '../domain/user-file/user-file.input'
import { defaultLogger as log } from '../logger'
import { UserCtx } from '../types'
import { clearOrphanedRepeatableJobs as utilsClearOrphanedRepeatableJobs } from './queue.utils'
import { BasicUserJob, CheckStatusJob, SendEmailJob, SyncDbClusterJob, Task } from './task.input'

let mainQueue: Bull.Queue
let fileSyncQueue: Bull.Queue
let spaceReportQueue: Bull.Queue
let emailsQueue: Bull.Queue
let maintenanceQueue: Bull.Queue
let mainJobProducer: MainQueueJobProducer
let fileSyncJobProducer: FileSyncQueueJobProducer
let emailsJobProducer: EmailQueueJobProducer
let maintenanceJobProducer: MaintenanceQueueJobProducer

const getMainQueue = (): Bull.Queue => mainQueue
const getFileSyncQueue = (): Bull.Queue => fileSyncQueue
const getEmailsQueue = (): Bull.Queue => emailsQueue
const getMaintenanceQueue = (): Bull.Queue => maintenanceQueue

const getQueues = (): Bull.Queue[] => [
  mainQueue,
  fileSyncQueue,
  spaceReportQueue,
  emailsQueue,
  maintenanceQueue,
]

const clearOrphanedRepeatableJobs = async (q: Queue): Promise<Bull.JobInformation[]> => {
  return await utilsClearOrphanedRepeatableJobs(q)
}

// set up the queues
const createQueues = async (provider: QueueProxy): Promise<void> => {
  log.log({}, 'Initializing queues')

  mainQueue = provider.mainQueue
  emailsQueue = provider.emailQueue
  fileSyncQueue = provider.fileSyncQueue
  spaceReportQueue = provider.spaceReportQueue
  maintenanceQueue = provider.maintenanceQueue
  mainJobProducer = provider.mainQueueJobProducer
  maintenanceJobProducer = provider.maintenanceQueueJobProducer
  fileSyncJobProducer = provider.fileSyncQueueJobProducer
  emailsJobProducer = provider.emailQueueJobProducer
  await mainQueue.isReady()
  await fileSyncQueue.isReady()
  await emailsQueue.isReady()
  await maintenanceQueue.isReady()
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  await initMaintenanceQueue()

  // TODO - doing 'await clearOrphanedRepeatableJobs' will cause nodejs-api tests to fail
  //        by exceeding timeout on GitHub but it works fine locally.
  //        Find a better solution at some point.
  const removedJobs = clearOrphanedRepeatableJobs(mainQueue)
  log.log({ removedJobs }, 'createQueues: Removed orphaned repeatable jobs.')
}

const logQueueStatus = async () => {
  await Promise.all(
    getQueues().map(async (q) => {
      log.log(
        {
          queueStatus: q.client.status,
          currentJobCounts: await q.getJobCounts(),
          repeatableJobs: await q.getRepeatableJobs(),
        },
        `${q.name} status on startup`,
      )
    }),
  )
}

const initMaintenanceQueue = async () => {
  log.log({}, 'Initializing maintenance queue')
  if (config.workerJobs.queues.maintenance.onInit.checkNonterminatedClusters) {
    await maintenanceJobProducer.createCheckNonTerminatedDbClustersTask()
  }

  if (config.workerJobs.queues.maintenance.onInit.userInactivityAlert) {
    await maintenanceJobProducer.createUserInactivityAlertTask()
  }

  if (config.workerJobs.queues.maintenance.onInit.adminDataConsistencyReport) {
    await maintenanceJobProducer.createCheckAdminDataConsistencyReportTask()
  }

  await maintenanceJobProducer.createCheckChallengeJobsTask()
}

// removeRepeatable and removeRepeatableJob explanation:
//     removeRepeatable calls calls queue.removeJobs, removing the job task
//     removeRepeatableJob calls queue.removeRepeatable, removing the entity with 'cron'
// Hypothesis: if we remove the repeatableJob (the entity with 'cron') alongside the job as is currently done
//             when a sync task such as SyncJobOperation finishes, it may be the most correct way of cleaning
//             up repeatable jobs
// TODO: dig deeper into bull queue's implementation to verify the above
const removeRepeatable = async (job: Job, queue?: Queue) => {
  if (typeof mainQueue === 'undefined') {
    throw new Error('The queue was not started')
  }
  log.log({ jobId: job.id }, 'trying to remove repeatable job id')
  // this does not work because we need to remove the next scheduled job
  const [prefix, id] = job.id.toString().split(':')
  await (queue ?? mainQueue).removeJobs(`${prefix}:${id}:*`)
}

const removeRepeatableJob = async (job: JobInformation, queue: Queue) => {
  log.log(
    { jobId: job.id, cron: job.cron },
    'removeRepeatableJob: trying to remove repeatable job',
  )
  // await mainQueue.removeRepeatableByKey(job.key)
  await queue.removeRepeatable({ jobId: job.id, cron: job.cron })
}

const findRepeatable = async (bullJobId: string) => {
  const repeatableJobs = await mainQueue.getRepeatableJobs()
  return repeatableJobs.find((j) => j.id === bullJobId)
}

// TASK PRODUCERS
/**
 * @deprecated Use the job producer directly within the DI
 */
const createSyncFilesStateTask = (user: UserCtx) => mainJobProducer.createSyncFilesStateTask(user)

/**
 * @deprecated Use the job producer directly within the DI
 */
const createSyncJobStatusTask = async (data: CheckStatusJob['payload'], user: UserCtx) =>
  mainJobProducer.createSyncJobStatusTask(data, user)

/**
 * @deprecated Use the job producer directly within the DI
 */
const createSyncOutputsTask = async (data: CheckStatusJob['payload'], user: UserCtx) =>
  fileSyncJobProducer.createSyncOutputsTask(data, user)

// Specifying a taskId will prevent multiple emails of that
// type and id to be sent
/**
 * @deprecated Use the job producer directly within the DI
 */
const createSendEmailTask = async (
  data: SendEmailJob['payload'],
  user: UserCtx | undefined,
  taskId?: string,
) => emailsJobProducer.createSendEmailTask(data, user, taskId)

/**
 * @deprecated Use the job producer directly within the DI
 */
const removeFromEmailQueue = (jobId: string) => emailsJobProducer.removeJobs(jobId)

/**
 * @deprecated Use the job producer directly within the DI
 */
const createSyncSpacesPermissionsTask = async (user: UserCtx) =>
  maintenanceJobProducer.createSyncSpacesPermissionsTask(user)

/**
 * @deprecated Use the job producer directly within the DI
 */
const createRemoveNodesJobTask = async (ids: number[], user: UserCtx) =>
  fileSyncJobProducer.createRemoveNodesJobTask(ids, user)

/**
 * @deprecated Use the job producer directly within the DI
 */
const createRunFollowUpActionJobTask = async (payload: UidAndFollowUpInput, user?: UserCtx) =>
  mainJobProducer.createRunFollowUpActionJobTask(payload, user)

/**
 * @deprecated Use the job producer directly within the DI
 */
const createFileSynchronizeJobTask = async (
  payload: SyncFileJobInput,
  user?: UserCtx,
  delayInMs?: number,
) => mainJobProducer.createFileSynchronizeJobTask(payload, user, delayInMs)

/**
 * @deprecated Use the job producer directly within the DI
 */
const createCloseFileJobTask = async (payload: FileUidInput, user?: UserCtx) =>
  mainJobProducer.createCloseFileJobTask(payload, user)

/**
 * @deprecated Use the job producer directly within the DI
 */
const createLockNodesJobTask = async (ids: number[], user: UserCtx) =>
  fileSyncJobProducer.createLockNodesJobTask(ids, user)

/**
 * @deprecated Use the job producer directly within the DI
 */
const createUnlockNodesJobTask = async (ids: number[], user: UserCtx) =>
  fileSyncJobProducer.createUnlockNodesJobTask(ids, user)

/**
 * @deprecated Use the job producer directly within the DI
 */
const createDbClusterSyncTask = async (data: SyncDbClusterJob['payload'], user: UserCtx) =>
  mainJobProducer.createDbClusterSyncTask(data, user)

/**
 * @deprecated Use the job producer directly within the DI
 */
const createUserCheckupTask = async (data: BasicUserJob) =>
  maintenanceJobProducer.createUserCheckupTask(data)

/**
 * @deprecated Use the job producer directly within the DI
 */
const createCheckUserJobsTask = async (data: BasicUserJob) =>
  maintenanceJobProducer.createCheckUserJobsTask(data)

/**
 * @deprecated Use the job producer directly within the DI
 */
const createTestMaxMemoryTask = async (): Promise<any> =>
  maintenanceJobProducer.createTestMaxMemoryTask()

// Queue adding helpers
/**
 * @deprecated Use the job producer directly within the DI
 */
const addToFileSyncQueueEnsureUnique = async <T extends Task>(task: T, jobId: string | undefined) =>
  fileSyncJobProducer.addToQueueEnsureUnique(task, jobId)

export * as debug from './queue.debug'

export { CleanupWorkerQueueOperation } from './ops/cleanup-worker-queue'

export {
  createSyncFilesStateTask,
  createSyncJobStatusTask,
  createSendEmailTask,
  removeFromEmailQueue,
  createSyncSpacesPermissionsTask,
  createDbClusterSyncTask,
  createFileSynchronizeJobTask,
  createSyncOutputsTask,
  createUserCheckupTask,
  createCheckUserJobsTask,
  createTestMaxMemoryTask,
  createQueues,
  getMainQueue,
  createRemoveNodesJobTask,
  getFileSyncQueue,
  getEmailsQueue,
  getMaintenanceQueue,
  getQueues,
  removeRepeatable,
  removeRepeatableJob,
  findRepeatable,
  addToFileSyncQueueEnsureUnique,
  createRunFollowUpActionJobTask,
  createCloseFileJobTask,
  clearOrphanedRepeatableJobs,
  createLockNodesJobTask,
  createUnlockNodesJobTask,
  logQueueStatus,
}
