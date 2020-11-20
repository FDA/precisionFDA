import sinon from 'sinon'
import Bull, { Job } from 'bull'
import { client, queue } from '@pfda/https-apps-shared'
import { handler } from '../../src/jobs'
import * as generate from './generate'

const sandbox = sinon.createSandbox()

const fakes = {
  client: {
    jobDescribeFake: sinon.stub().callsFake(() => ({ result: 'yep' })),
    jobCreateFake: sinon.stub().callsFake(() => ({ id: generate.job.jobId() })),
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
