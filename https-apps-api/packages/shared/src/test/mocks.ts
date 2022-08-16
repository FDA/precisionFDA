import sinon from 'sinon'
import Bull from 'bull'
import { client, queue } from '..'
// import { handler } from '../../src/jobs'
import * as generate from './generate'
import {
  FILES_DESC_RES,
  FILES_LIST_RES_ROOT,
  FOLDERS_LIST_RES,
  DBCLUSTER_DESC_RES,
} from './mock-responses'

const sandbox = sinon.createSandbox()

const fakes = {
  client: {
    jobDescribeFake: sinon.stub(),
    jobCreateFake: sinon.stub(),
    jobTerminateFake: sinon.stub(),
    filesListFake: sinon.stub(),
    filesDescFake: sinon.stub(),
    foldersListFake: sinon.stub(),
    folderRenameFake: sinon.stub(),
    folderRemoveFake: sinon.stub(),
    folderCreateFake: sinon.stub(),
    filesMoveFake: sinon.stub(),
    dbClusterActionFake: sinon.stub(),
    dbClusterCreateFake: sinon.stub(),
    dbClusterDescribeFake: sinon.stub(),
  },
  queue: {
    findRepeatableFake: sinon.stub(),
    removeRepeatableFake: sinon.fake(),
    removeRepeatableJobsFake: sinon.fake(),
    createCheckUserJobsTask: sinon.fake(),
    createDbClusterSyncTaskFake: sinon.fake(),
    createEmailSendTaskFake: sinon.fake(),
    createSyncJobStatusTaskFake: sinon.fake(),
    createSyncWorkstationFilesTask: sinon.fake(),
    createUserCheckupTask: sinon.fake(),
  },
  bull: {
    // process cannot be blocking in tests
    processFake: sinon.fake(),
    isReadyFake: sinon.fake(),
  },
}

const mocksSetDefaultBehaviour = () => {
  // all the stubs should be listed here
  fakes.client.jobDescribeFake.callsFake(() => ({ result: 'yep' }))
  fakes.client.jobCreateFake.callsFake(() => ({ id: generate.job.jobId() }))
  fakes.client.jobTerminateFake.callsFake(() => ({ id: generate.job.jobId() }))
  fakes.client.folderRenameFake.callsFake(() => ({ id: generate.job.jobId() }))
  fakes.client.folderRemoveFake.callsFake(() => ({ id: generate.job.jobId() }))
  fakes.client.folderCreateFake.callsFake(() => ({ id: generate.job.jobId() }))
  fakes.client.filesMoveFake.callsFake(() => ({ id: generate.job.jobId() }))
  fakes.client.filesListFake.callsFake(() => FILES_LIST_RES_ROOT)
  fakes.client.filesDescFake.callsFake(() => FILES_DESC_RES)
  fakes.client.foldersListFake.callsFake(() => FOLDERS_LIST_RES)
  fakes.client.dbClusterActionFake.callsFake(() => ({
    id: generate.dbCluster.simple().dxid
  }))
  fakes.client.dbClusterCreateFake.callsFake(() => ({
    id: generate.dbCluster.simple().dxid
  }))
  fakes.client.dbClusterDescribeFake.callsFake(() => DBCLUSTER_DESC_RES)
}

const mocksSetup = () => {
  mocksSetDefaultBehaviour()
  // client
  sandbox.replace(client.PlatformClient.prototype, 'jobDescribe', fakes.client.jobDescribeFake)
  sandbox.replace(client.PlatformClient.prototype, 'jobCreate', fakes.client.jobCreateFake)
  sandbox.replace(client.PlatformClient.prototype, 'jobTerminate', fakes.client.jobTerminateFake)
  sandbox.replace(client.PlatformClient.prototype, 'filesListPaginated', fakes.client.filesListFake)
  sandbox.replace(client.PlatformClient.prototype, 'folderCreate', fakes.client.folderCreateFake)
  sandbox.replace(client.PlatformClient.prototype, 'filesMoveToFolder', fakes.client.filesMoveFake)
  // sandbox.replace(client.PlatformClient.prototype, 'filesDescribe', fakes.client.filesDescFake)
  sandbox.replace(client.PlatformClient.prototype, 'foldersList', fakes.client.foldersListFake)
  sandbox.replace(client.PlatformClient.prototype, 'renameFolder', fakes.client.folderRenameFake)
  sandbox.replace(client.PlatformClient.prototype, 'removeFolderRec', fakes.client.folderRemoveFake)
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
  // stub queue helpers
  sandbox.replace(queue, 'findRepeatable', fakes.queue.findRepeatableFake)
  sandbox.replace(queue, 'removeRepeatable', fakes.queue.removeRepeatableFake)
  sandbox.replace(queue, 'removeRepeatableJob', fakes.queue.removeRepeatableJobsFake)
  sandbox.replace(queue, 'createCheckUserJobsTask', fakes.queue.createCheckUserJobsTask)
  sandbox.replace(queue, 'createDbClusterSyncTask', fakes.queue.createDbClusterSyncTaskFake)
  sandbox.replace(queue, 'createSendEmailTask', fakes.queue.createEmailSendTaskFake)
  sandbox.replace(queue, 'createSyncJobStatusTask', fakes.queue.createSyncJobStatusTaskFake)
  sandbox.replace(queue, 'createSyncWorkstationFilesTask', fakes.queue.createSyncWorkstationFilesTask)
  sandbox.replace(queue, 'createUserCheckupTask', fakes.queue.createUserCheckupTask)
}

const mocksReset = () => {
  fakes.client.jobDescribeFake.reset()
  fakes.client.jobCreateFake.reset()
  fakes.client.jobTerminateFake.reset()
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

  fakes.queue.findRepeatableFake.reset()

  fakes.queue.removeRepeatableFake.resetHistory()
  fakes.queue.removeRepeatableJobsFake.resetHistory()
  fakes.queue.createCheckUserJobsTask.resetHistory()
  fakes.queue.createDbClusterSyncTaskFake.resetHistory()
  fakes.queue.createEmailSendTaskFake.resetHistory()
  fakes.queue.createSyncJobStatusTaskFake.resetHistory()
  fakes.queue.createSyncWorkstationFilesTask.resetHistory()
  fakes.queue.createUserCheckupTask.resetHistory()

  fakes.bull.processFake.resetHistory()
  fakes.bull.isReadyFake.resetHistory()

  mocksSetDefaultBehaviour()
}

const mocksRestore = () => {
  sandbox.restore()
}

export { fakes, mocksSetup, mocksRestore, mocksReset }
