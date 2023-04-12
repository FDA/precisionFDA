import sinon from 'sinon'
import Bull from 'bull'
import { client, queue, redis } from '..'
// import { handler } from '../../src/jobs'
import * as generate from './generate'
import {
  FILES_DESC_RES,
  FILES_LIST_RES_ROOT,
  FOLDERS_LIST_RES,
  DBCLUSTER_DESC_RES,
  FIND_MEMBERS_RES,
  FILE_REMOVED_RES,
} from './mock-responses'
import { FileCloseParams } from '../platform-client/platform-client.params'
import { createMockServiceFactory } from './mock-service-factory'
import { RedisClient } from 'redis'


const mockServiceFactory = createMockServiceFactory()

const sandbox = sinon.createSandbox()

const fakes = {
  client: {
    jobDescribeFake: sinon.stub(),
    jobCreateFake: sinon.stub(),
    jobTerminateFake: sinon.stub(),
    fileCloseFake: sinon.stub(),
    fileDescribeFake: sinon.stub(),
    fileStatesFake: sinon.stub(),
    filesListFake: sinon.stub(),
    filesDescFake: sinon.stub(),
    foldersListFake: sinon.stub(),
    folderRenameFake: sinon.stub(),
    folderRemoveFake: sinon.stub(),
    folderCreateFake: sinon.stub(),
    filesMoveFake: sinon.stub(),
    fileRemoveFake: sinon.stub(),
    dbClusterActionFake: sinon.stub(),
    dbClusterCreateFake: sinon.stub(),
    dbClusterDescribeFake: sinon.stub(),
    projectCreateFake: sinon.stub(),
    projectInviteFake: sinon.stub(),
    findSpaceMembersFake: sinon.stub(),
    inviteUserToOrganizationFake: sinon.stub(),
    removeUserFromOrganizationFake: sinon.stub(),
  },
  queue: {
    findRepeatableFake: sinon.stub(),
    removeRepeatableFake: sinon.fake(),
    removeRepeatableJobsFake: sinon.fake(),
    createCheckUserJobsTask: sinon.fake(),
    createDbClusterSyncTaskFake: sinon.fake(),
    createEmailSendTaskFake: sinon.fake(),
    createSyncFilesStateTask: sinon.fake(),
    createSyncJobStatusTaskFake: sinon.fake(),
    createSyncWorkstationFilesTask: sinon.fake(),
    createUserCheckupTask: sinon.fake(),
    createSyncSpacesPermissionsTask: sinon.fake(),
    clearOrphanedRepeatableJobs: sinon.fake(),
  },
  bull: {
    // process cannot be blocking in tests
    processFake: sinon.fake(),
    isReadyFake: sinon.fake(),
    addFake: sinon.stub(),
    getJobFake: sinon.stub(),
  },
  notificationService: mockServiceFactory.notificationService,
  platformAuthClient: mockServiceFactory.platformAuthClient,
  workstationClient: mockServiceFactory.workstationClient,
}

const mocksSetDefaultBehaviour = () => {
  // all the stubs should be listed here
  fakes.client.jobDescribeFake.callsFake(() => ({ result: 'yep' }))
  fakes.client.jobCreateFake.callsFake(() => ({ id: generate.job.jobId() }))
  fakes.client.jobTerminateFake.callsFake(() => ({ id: generate.job.jobId() }))
  fakes.client.fileCloseFake.callsFake((params: FileCloseParams) => ({ id: params.fileDxid }))
  fakes.client.folderRenameFake.callsFake(() => ({ id: generate.job.jobId() }))
  fakes.client.folderRemoveFake.callsFake(() => ({ id: generate.job.jobId() }))
  fakes.client.folderCreateFake.callsFake(() => ({ id: generate.job.jobId() }))
  fakes.client.fileRemoveFake.callsFake(() => FILE_REMOVED_RES)
  fakes.client.filesMoveFake.callsFake(() => ({ id: generate.job.jobId() }))
  fakes.client.filesListFake.callsFake(() => FILES_LIST_RES_ROOT)
  fakes.client.filesDescFake.callsFake(() => FILES_DESC_RES)
  fakes.client.foldersListFake.callsFake(() => FOLDERS_LIST_RES)
  fakes.client.findSpaceMembersFake.callsFake(() => FIND_MEMBERS_RES)

  fakes.client.dbClusterActionFake.callsFake(() => ({
    id: generate.dbCluster.simple().dxid,
  }))
  fakes.client.dbClusterCreateFake.callsFake(() => ({
    id: generate.dbCluster.simple().dxid,
  }))
  fakes.client.dbClusterDescribeFake.callsFake(() => DBCLUSTER_DESC_RES)
  fakes.client.projectCreateFake.callsFake(() => ({ id: generate.space.projectId() }))
  fakes.client.projectInviteFake.callsFake(() => ({ id: 'huh', state: 'accepted' })) //fix id

  fakes.bull.addFake.callsFake(() => { })
  fakes.bull.getJobFake.callsFake(() => undefined)

  mockServiceFactory.reset()
}

const mocksSetup = () => {
  mocksSetDefaultBehaviour()
  // client
  sandbox.replace(client.PlatformClient.prototype, 'jobDescribe', fakes.client.jobDescribeFake)
  sandbox.replace(client.PlatformClient.prototype, 'jobCreate', fakes.client.jobCreateFake)
  sandbox.replace(client.PlatformClient.prototype, 'jobTerminate', fakes.client.jobTerminateFake)
  sandbox.replace(client.PlatformClient.prototype, 'fileClose', fakes.client.fileCloseFake)
  sandbox.replace(client.PlatformClient.prototype, 'fileDescribe', fakes.client.fileDescribeFake)
  sandbox.replace(client.PlatformClient.prototype, 'fileStates', fakes.client.fileStatesFake)
  sandbox.replace(client.PlatformClient.prototype, 'filesList', fakes.client.filesListFake)
  sandbox.replace(client.PlatformClient.prototype, 'folderCreate', fakes.client.folderCreateFake)
  sandbox.replace(client.PlatformClient.prototype, 'filesMoveToFolder', fakes.client.filesMoveFake)
  // sandbox.replace(client.PlatformClient.prototype, 'filesDescribe', fakes.client.filesDescFake)
  sandbox.replace(client.PlatformClient.prototype, 'foldersList', fakes.client.foldersListFake)
  sandbox.replace(client.PlatformClient.prototype, 'renameFolder', fakes.client.folderRenameFake)
  sandbox.replace(client.PlatformClient.prototype, 'projectInvite', fakes.client.projectInviteFake)
  sandbox.replace(client.PlatformClient.prototype, 'projectCreate', fakes.client.projectCreateFake)
  sandbox.replace(client.PlatformClient.prototype, 'findSpaceMembers', fakes.client.findSpaceMembersFake)
  sandbox.replace(client.PlatformClient.prototype, 'inviteUserToOrganization', fakes.client.inviteUserToOrganizationFake)
  sandbox.replace(client.PlatformClient.prototype, 'removeUserFromOrganization', fakes.client.removeUserFromOrganizationFake)
  sandbox.replace(client.PlatformClient.prototype, 'folderRemove', fakes.client.folderRemoveFake)
  sandbox.replace(client.PlatformClient.prototype, 'fileRemove', fakes.client.fileRemoveFake)

  sandbox.replace(
    client.PlatformClient.prototype,
    'dbClusterAction',
    fakes.client.dbClusterActionFake,
  )
  sandbox.replace(
    client.PlatformClient.prototype,
    'dbClusterCreate',
    fakes.client.dbClusterCreateFake,
  )
  sandbox.replace(
    client.PlatformClient.prototype,
    'dbClusterDescribe',
    fakes.client.dbClusterDescribeFake,
  )

  // stub Bull
  sandbox.replace(Bull.prototype, 'process', fakes.bull.processFake)
  sandbox.replace(Bull.prototype, 'isReady', fakes.bull.isReadyFake)
  sandbox.replace(Bull.prototype, 'add', fakes.bull.addFake)
  sandbox.replace(Bull.prototype, 'getJob', fakes.bull.getJobFake)

  // stub queue helpers
  sandbox.replace(queue, 'findRepeatable', fakes.queue.findRepeatableFake)
  sandbox.replace(queue, 'removeRepeatable', fakes.queue.removeRepeatableFake)
  sandbox.replace(queue, 'removeRepeatableJob', fakes.queue.removeRepeatableJobsFake)
  sandbox.replace(queue, 'createCheckUserJobsTask', fakes.queue.createCheckUserJobsTask)
  sandbox.replace(queue, 'createDbClusterSyncTask', fakes.queue.createDbClusterSyncTaskFake)
  sandbox.replace(queue, 'createSendEmailTask', fakes.queue.createEmailSendTaskFake)
  sandbox.replace(queue, 'createSyncFilesStateTask', fakes.queue.createSyncFilesStateTask)
  sandbox.replace(queue, 'createSyncJobStatusTask', fakes.queue.createSyncJobStatusTaskFake)
  sandbox.replace(queue, 'createSyncWorkstationFilesTask', fakes.queue.createSyncWorkstationFilesTask)
  sandbox.replace(queue, 'createUserCheckupTask', fakes.queue.createUserCheckupTask)
  sandbox.replace(queue, 'createSyncSpacesPermissionsTask', fakes.queue.createSyncSpacesPermissionsTask)
  sandbox.replace(queue, 'clearOrphanedRepeatableJobs', fakes.queue.clearOrphanedRepeatableJobs)
  sandbox.stub(redis, 'createRedisClient').returns({
    publish(channel: string, value: string) { }
  } as RedisClient)
}

const mocksReset = () => {
  fakes.client.jobDescribeFake.reset()
  fakes.client.jobCreateFake.reset()
  fakes.client.jobTerminateFake.reset()
  fakes.client.fileCloseFake.reset()
  fakes.client.fileDescribeFake.reset()
  fakes.client.fileStatesFake.reset()
  fakes.client.filesListFake.reset()
  fakes.client.filesDescFake.reset()
  fakes.client.foldersListFake.reset()
  fakes.client.folderRenameFake.reset()
  fakes.client.folderRemoveFake.reset()
  fakes.client.folderCreateFake.reset()
  fakes.client.filesMoveFake.reset()
  fakes.client.dbClusterActionFake.reset()
  fakes.client.dbClusterCreateFake.reset()
  fakes.client.dbClusterDescribeFake.reset()
  fakes.client.projectCreateFake.reset()
  fakes.client.projectInviteFake.reset()
  fakes.client.findSpaceMembersFake.reset()
  fakes.client.inviteUserToOrganizationFake.reset()
  fakes.client.removeUserFromOrganizationFake.reset()
  fakes.client.fileRemoveFake.reset()

  fakes.queue.findRepeatableFake.reset()

  fakes.queue.removeRepeatableFake.resetHistory()
  fakes.queue.removeRepeatableJobsFake.resetHistory()
  fakes.queue.createCheckUserJobsTask.resetHistory()
  fakes.queue.createDbClusterSyncTaskFake.resetHistory()
  fakes.queue.createEmailSendTaskFake.resetHistory()
  fakes.queue.createSyncFilesStateTask.resetHistory()
  fakes.queue.createSyncJobStatusTaskFake.resetHistory()
  fakes.queue.createSyncWorkstationFilesTask.resetHistory()
  fakes.queue.createUserCheckupTask.resetHistory()
  fakes.queue.createSyncSpacesPermissionsTask.resetHistory()
  fakes.queue.clearOrphanedRepeatableJobs.resetHistory()

  fakes.bull.processFake.resetHistory()
  fakes.bull.isReadyFake.resetHistory()
  fakes.bull.addFake.resetHistory()
  fakes.bull.getJobFake.resetHistory()

  mocksSetDefaultBehaviour()
}

const mocksRestore = () => {
  sandbox.restore()
}

export { fakes, mocksSetup, mocksRestore, mocksReset }
