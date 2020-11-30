import sinon from 'sinon'
import Bull, { Job } from 'bull'
import { client, queue } from '@pfda/https-apps-shared'
import { handler } from '../../src/jobs'
import * as generate from './generate'
import { FILES_DESC_RES, FILES_LIST_RES } from './mock-responses'

const sandbox = sinon.createSandbox()

const fakes = {
  client: {
    jobDescribeFake: sinon.stub().callsFake(() => ({ result: 'yep' })),
    jobCreateFake: sinon.stub().callsFake(() => ({ id: generate.job.jobId() })),
    filesListFake: sinon.stub().callsFake(() => FILES_LIST_RES),
    filesDescFake: sinon.stub().callsFake(() => FILES_DESC_RES),
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

const mocksSetup = () => {
  // client
  sandbox.replace(client, 'jobDescribe', fakes.client.jobDescribeFake)
  sandbox.replace(client, 'jobCreate', fakes.client.jobCreateFake)
  sandbox.replace(client, 'filesList', fakes.client.filesListFake)
  sandbox.replace(client, 'describeFiles', fakes.client.filesDescFake)
  // stub Bull
  sandbox.replace(Bull.prototype, 'process', fakes.bull.processFake)
  sandbox.replace(Bull.prototype, 'add', fakes.bull.addToQueueStub)
  // stub queue helpers
  sandbox.replace(queue, 'removeRepeatable', fakes.queue.removeRepeatableFake)
}

const mocksRestore = () => {
  sandbox.restore()
}

export { fakes, mocksSetup, mocksRestore }
