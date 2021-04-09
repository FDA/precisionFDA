import sinon from 'sinon'
import Bull from 'bull'
import { client, queue } from '..'
// import { handler } from '../../src/jobs'
import * as generate from './generate'
import { FILES_DESC_RES, FILES_LIST_RES_ROOT, FOLDERS_LIST_RES } from './mock-responses'

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
  },
  queue: {
    removeRepeatableFake: sinon.fake(),
    createJobSyncTaskFake: sinon.fake(),
    createEmailSendTaskFake: sinon.fake(),
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
  // stub Bull
  sandbox.replace(Bull.prototype, 'process', fakes.bull.processFake)
  sandbox.replace(Bull.prototype, 'isReady', fakes.bull.isReadyFake)
  // stub queue helpers
  sandbox.replace(queue, 'removeRepeatable', fakes.queue.removeRepeatableFake)
  sandbox.replace(queue, 'createJobSyncTask', fakes.queue.createJobSyncTaskFake)
  sandbox.replace(queue, 'createSendEmailTask', fakes.queue.createEmailSendTaskFake)
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

  fakes.queue.removeRepeatableFake.resetHistory()
  fakes.queue.createJobSyncTaskFake.resetHistory()
  fakes.queue.createEmailSendTaskFake.resetHistory()
  fakes.bull.processFake.resetHistory()
  fakes.bull.isReadyFake.resetHistory()

  mocksSetDefaultBehaviour()
}

const mocksRestore = () => {
  sandbox.restore()
}

export { fakes, mocksSetup, mocksRestore, mocksReset }
