import sinon from 'sinon'
import Bull from 'bull'
import { client, queue } from '../..'
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
  },
  queue: {
    removeRepeatableFake: sinon.fake(),
    createJobSyncTaskFake: sinon.fake(),
  },
  bull: {
    // process cannot be blocking in tests
    processFake: sinon.fake(),
  },
}

const mocksSetDefaultBehaviour = () => {
  // all the stubs should be listed here
  fakes.client.jobDescribeFake.callsFake(() => ({ result: 'yep' }))
  fakes.client.jobCreateFake.callsFake(() => ({ id: generate.job.jobId() }))
  fakes.client.jobTerminateFake.callsFake(() => ({ id: generate.job.jobId() }))
  fakes.client.folderRenameFake.callsFake(() => ({ id: generate.job.jobId() }))
  fakes.client.folderRemoveFake.callsFake(() => ({ id: generate.job.jobId() }))
  fakes.client.filesListFake.callsFake(() => FILES_LIST_RES_ROOT)
  fakes.client.filesDescFake.callsFake(() => FILES_DESC_RES)
  fakes.client.foldersListFake.callsFake(() => FOLDERS_LIST_RES)
}

const mocksSetup = () => {
  mocksSetDefaultBehaviour()
  // client
  sandbox.replace(client, 'jobDescribe', fakes.client.jobDescribeFake)
  sandbox.replace(client, 'jobCreate', fakes.client.jobCreateFake)
  sandbox.replace(client, 'jobTerminate', fakes.client.jobTerminateFake)
  sandbox.replace(client, 'filesList', fakes.client.filesListFake)
  sandbox.replace(client, 'filesDescribe', fakes.client.filesDescFake)
  sandbox.replace(client, 'foldersList', fakes.client.foldersListFake)
  sandbox.replace(client, 'renameFolder', fakes.client.folderRenameFake)
  sandbox.replace(client, 'removeFolderRec', fakes.client.folderRemoveFake)
  // stub Bull
  sandbox.replace(Bull.prototype, 'process', fakes.bull.processFake)
  // stub queue helpers
  sandbox.replace(queue, 'removeRepeatable', fakes.queue.removeRepeatableFake)
  sandbox.replace(queue, 'createJobSyncTask', fakes.queue.createJobSyncTaskFake)
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

  fakes.queue.removeRepeatableFake.resetHistory()
  fakes.queue.createJobSyncTaskFake.resetHistory()
  fakes.bull.processFake.resetHistory()

  mocksSetDefaultBehaviour()
}

const mocksRestore = () => {
  sandbox.restore()
}

export { fakes, mocksSetup, mocksRestore, mocksReset }
