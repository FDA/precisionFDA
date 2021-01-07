import sinon from 'sinon'
import Bull, { Job } from 'bull'
import { client, queue } from '@pfda/https-apps-shared'
import { handler } from '../../src/jobs'
import * as generate from './generate'
import { FILES_DESC_RES, FILES_LIST_RES_ROOT } from './mock-responses'

const sandbox = sinon.createSandbox()

// todo: share this updated structure with api tests
const fakes = {
  client: {
    jobDescribeFake: sinon.stub(),
    jobCreateFake: sinon.stub(),
    filesListFake: sinon.stub(),
    filesDescFake: sinon.stub(),
  },
  queue: {
    removeRepeatableFake: sinon.fake(),
  },
  bull: {
    // process cannot be blocking in tests
    processFake: sinon.fake(),
    // add to queue triggers execution immediately
    addToQueueStub: sinon.stub().callsFake(async input => {
      await handler({ data: input } as Job)
    }),
  },
}

const mocksSetDefaultBehaviour = () => {
  // all the stubs should be listed here
  fakes.client.jobDescribeFake.callsFake(() => ({ result: 'yep' }))
  fakes.client.jobCreateFake.callsFake(() => ({ id: generate.job.jobId() }))
  fakes.client.filesListFake.callsFake(() => FILES_LIST_RES_ROOT)
  fakes.client.filesDescFake.callsFake(() => FILES_DESC_RES)
}

const mocksSetup = () => {
  mocksSetDefaultBehaviour()
  // client
  sandbox.replace(client, 'jobDescribe', fakes.client.jobDescribeFake)
  sandbox.replace(client, 'jobCreate', fakes.client.jobCreateFake)
  sandbox.replace(client, 'filesList', fakes.client.filesListFake)
  sandbox.replace(client, 'filesDescribe', fakes.client.filesDescFake)
  // stub Bull
  sandbox.replace(Bull.prototype, 'process', fakes.bull.processFake)
  sandbox.replace(Bull.prototype, 'add', fakes.bull.addToQueueStub)
  // stub queue helpers
  sandbox.replace(queue, 'removeRepeatable', fakes.queue.removeRepeatableFake)
}

const mocksReset = () => {
  fakes.client.jobDescribeFake.reset()
  fakes.client.jobCreateFake.reset()
  fakes.client.filesListFake.reset()
  fakes.client.filesDescFake.reset()

  fakes.queue.removeRepeatableFake.resetHistory()
  fakes.bull.processFake.resetHistory()
  fakes.bull.addToQueueStub.resetHistory()

  mocksSetDefaultBehaviour()
}

const mocksRestore = () => {
  sandbox.restore()
}

export { fakes, mocksSetup, mocksRestore, mocksReset }
